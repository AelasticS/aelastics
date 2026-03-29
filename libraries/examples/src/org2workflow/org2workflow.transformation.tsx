/** @jsx hm */
import { hm } from "aelastics-synthesis"
import { SpecPoint, SpecOption } from "aelastics-synthesis"
import { abstractM2M, M2M, E2E } from "aelastics-synthesis"
import { Element } from "aelastics-synthesis"

import * as ot from "./org-model.meta"
import * as wt from "./workflow.meta"
import * as w from "./workflow.jsx-comps"

export interface ITransformParam {
  worker: ot.IWorker       // the worker initiating the document
  sensitivity: number      // 1 = department only, 2 = up to division, 3 = up to board
}

@M2M()
export class Org2WorkflowTransformation extends abstractM2M<
  ot.IOrganization,
  wt.IWorkflowModel,
  {},
  never,
  ITransformParam
> {
  template(source: ot.IOrganization) {
    const { worker, sensitivity } = this.context.param!

    // Unfold hierarchy: starting from worker's department, follow parent links up to sensitivity levels
    const unfold = (unit: ot.IOrgUnit, levels: number): ot.IOrgUnit[] =>
      (levels <= 0) ? [] : unit.parent ? [unit, ...unfold(unit.parent as ot.IOrgUnit, levels - 1)] : [unit]

    return (
      <w.WorkflowModel name={`Approval`} MDA_level="M1">
        <w.Process name={`ApprovalFor${worker.name}`}>
          <w.Flow name="ApprovalSequence">
            <w.Task name="WriteDocument" performer={worker.name} />
            {unfold(worker.worksIn as ot.IDepartment, sensitivity).map((unit) => this.OrgUnit2Approval(unit))}
          </w.Flow>
        </w.Process>
      </w.WorkflowModel>
    )
  }

  @E2E()
  @SpecPoint()
  OrgUnit2Approval(unit: ot.IOrgUnit): Element<wt.IStep> {
    return (
      <w.Task name={`ApproveBy${unit.name}`} />
    )
  }

  @SpecOption("OrgUnit2Approval", ot.Department)
  Department2Approval(dept: ot.IDepartment): Element<wt.ITask> {
    return (
      <w.Task name={`ApproveBy${dept.manager.name}`} performer={dept.manager.name} />
    )
  }

  @SpecOption("OrgUnit2Approval", ot.Board)
  Board2Approval(board: ot.IBoard): Element<wt.IParallel> {
    return (
      <w.Parallel name={`BoardApproval${board.name}`}>
        {board.members.map((member) => (
          <w.Task name={`ApproveBy${member.name}`} performer={member.name} />
        ))}
      </w.Parallel>
    )
  }
}

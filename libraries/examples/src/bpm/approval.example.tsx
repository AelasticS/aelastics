/** @jsx hm */
import { hm } from "aelastics-synthesis";
import * as bpm from "./BPM.jsx-comps";

const approvalModel = () => (
  <bpm.Process name="Approval">
    <bpm.Sequence>
      <bpm.Task name="Write" />
      <bpm.Parallel>
        <bpm.Task name="Approve 1"/>
        <bpm.Task name="Approve 2"/>
      </bpm.Parallel>
    </bpm.Sequence>
  </bpm.Process>
);

/* example 
const approvalModel = () => (createElement(bpm.Process, { name: "Approval" },
    createElement(bpm.Sequence, null,
        createElement(bpm.Task, { name: "Write" }),
        createElement(bpm.Parallel, null,
            createElement(bpm.Task, { name: "Approve 1" }),
            createElement(bpm.Task, { name: "Approve 2" })
		)
	)));

    let myModel = approvalModel()

  */
/** @jsx createExprNode */
import { createExprNode } from 'aelastics-synthesis'
import { Context } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'
import * as ot from './org-model.meta'
import * as wt from './workflow.meta'
import { acmeCorpModel } from './acme-corp.model'
import { Org2WorkflowTransformation } from './org2workflow.transformation'

describe("Org2Workflow Transformation", () => {

    let store: ModelStore
    let source: ot.IOrganization

    beforeEach(() => {
        store = new ModelStore()
        const sourceElement = acmeCorpModel(store)
        source = sourceElement.render<ot.IOrganization>(new Context())
    })

    // Helper: find a worker by name from source model elements
    const findWorker = (name: string): ot.IWorker => {
        const worker = source.elements.find(
            (el) => store.isTypeOf(el, ot.Worker) && el.name === name
        ) as ot.IWorker | undefined
        if (!worker) throw new Error(`Worker "${name}" not found`)
        return worker
    }

    it("transforms with sensitivity=3 (Judy: Engineering -> Technology Division -> Board)", () => {
        const judy = findWorker("Judy")
        const transformation = new Org2WorkflowTransformation(store)
        const result = transformation.transform(source, {
            worker: judy,
            sensitivity: 3
        })

        expect(result).toHaveProperty("name", "Approval")

        expect(result.processes).toHaveLength(1)
        const process = result.processes[0]
        expect(process).toHaveProperty("name", "ApprovalForJudy")

        const sequence = process.flow as wt.ISequence
        expect(sequence.steps).toBeDefined()
        expect(sequence.steps).toHaveLength(4)

        // Step 1: Write document by Judy
        const writeTask = sequence.steps[0] as wt.ITask
        expect(writeTask).toHaveProperty("name", "WriteDocument")
        expect(writeTask).toHaveProperty("performer", "Judy")

        // Step 2: Engineering dept approval by Grace (manager)
        const engApproval = sequence.steps[1] as wt.ITask
        expect(engApproval).toHaveProperty("performer", "Grace")

        // Step 3: Technology Division approval by Dave (manager)
        const techApproval = sequence.steps[2] as wt.ITask
        expect(techApproval).toHaveProperty("performer", "Dave")

        // Step 4: Board parallel approval (Alice, Bob, Carol)
        const boardApproval = sequence.steps[3] as wt.IParallel
        expect(boardApproval.steps).toHaveLength(3)
        const boardPerformers = (boardApproval.steps as wt.ITask[]).map((t) => t.performer)
        expect(boardPerformers).toContain("Alice")
        expect(boardPerformers).toContain("Bob")
        expect(boardPerformers).toContain("Carol")
    })

    it("transforms with sensitivity=1 (Judy: Engineering only)", () => {
        const judy = findWorker("Judy")
        const transformation = new Org2WorkflowTransformation(store)
        const result = transformation.transform(source, {
            worker: judy,
            sensitivity: 1
        })

        expect(result).toHaveProperty("name", "Approval")

        const process = result.processes[0]
        const sequence = process.flow as wt.ISequence

        expect(sequence.steps).toHaveLength(2)

        const writeTask = sequence.steps[0] as wt.ITask
        expect(writeTask).toHaveProperty("name", "WriteDocument")
        expect(writeTask).toHaveProperty("performer", "Judy")

        const engApproval = sequence.steps[1] as wt.ITask
        expect(engApproval).toHaveProperty("performer", "Grace")
    })

    it("transforms with sensitivity=2 (Judy: Engineering -> Technology Division)", () => {
        const judy = findWorker("Judy")
        const transformation = new Org2WorkflowTransformation(store)
        const result = transformation.transform(source, {
            worker: judy,
            sensitivity: 2
        })

        const process = result.processes[0]
        const sequence = process.flow as wt.ISequence

        expect(sequence.steps).toHaveLength(3)

        const writeTask = sequence.steps[0] as wt.ITask
        expect(writeTask).toHaveProperty("performer", "Judy")

        const engApproval = sequence.steps[1] as wt.ITask
        expect(engApproval).toHaveProperty("performer", "Grace")

        const techApproval = sequence.steps[2] as wt.ITask
        expect(techApproval).toHaveProperty("performer", "Dave")
    })
})

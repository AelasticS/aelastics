
import * as g from 'generic-metamodel'
import { ModelStore } from './ModelsStore'

let contextInstance: Context | undefined

export class Context {
    private storeStack: Array<ModelStore> = []
    private modelStack: Array<g.IModel> = []
    public localIDs: Map<string, g.IModelElement> = new Map()

    constructor() {
        if (contextInstance) {
            throw new Error("New context instance cannot be created!");
        }
        contextInstance = this;
    }

    public get store(): ModelStore {
        if (this.storeStack.length > 0)
            return this.storeStack[this.storeStack.length - 1]
        else
            throw new Error("No store in the context!");
    }

    public get model(): g.IModel | undefined {
        if (this.modelStack.length > 0)
            return this.modelStack[this.modelStack.length - 1]
    }

    public pushModel = (m: g.IModel) => {
        this.modelStack.push(m)
    }

    public popModel = () => {
        this.modelStack.pop()
    }

    public pushStore = (s: ModelStore) => {
        this.storeStack.push(s)
    }

    public popStore = () => {
        this.storeStack.pop()
    }

}

export const useContext = (): Context => {
    if (!contextInstance)
        contextInstance = new Context()
    return contextInstance
}
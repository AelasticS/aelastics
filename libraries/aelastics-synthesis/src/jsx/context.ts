
import { truncate } from 'fs'
import * as g from 'generic-metamodel'
import { ModelStore } from './ModelsStore'
import { IStack, ArrayStack } from './stack'

let maxlocalID: number = 0

export class Context {
    public readonly storeStack: IStack<ModelStore> = new ArrayStack()
    public readonly modelStack: IStack<g.IModel> = new ArrayStack()
    public readonly namespaceStack: IStack<g.INamespace> = new ArrayStack // used to resolve names
    public localIDs: Map<string, g.IModelElement> = new Map()


    // used to generate unique names, if ommited during creation of model elements
    public get generateID():string {  
        return (++maxlocalID).toString()
    }

    public get store(): ModelStore {
        try {
            return this.storeStack.peek()
        }
        catch (e: any) {
            throw new Error("No store in the context!");

        }
    }

    public pushStore = (s: ModelStore) => {
        this.storeStack.push(s)
    }

    public popStore = () => {
        this.storeStack.pop()
    }

    public get model(): g.IModel | undefined {
        try {
            return this.modelStack.peek()
        }
        catch (e: any) {
            return undefined;

        }
    }

    public pushModel = (m: g.IModel) => {
        this.modelStack.push(m)
        // model is also namespace
        this.namespaceStack.push(m)
    }

    public popModel = () => {
        const m = this.modelStack.pop()
        // remove namespacess within the model
        while(this.namespaceStack.peek() != m) {
            this.namespaceStack.pop
        }
        // model is also namespace
        this.namespaceStack.pop()
    }

    public get namespace(): g.INamespace | undefined {
        try {
            return this.namespaceStack.peek()
        }
        catch (e: any) {
            return undefined;

        }
    }

    public pushNamespace = (m: g.INamespace) => {
        this.namespaceStack.push(m)
    }

    public popNamespace = () => {
        this.namespaceStack.pop()
    }


}


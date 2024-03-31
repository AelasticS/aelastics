import { truncate } from "fs";
import * as g from "generic-metamodel";
import { ModelStore } from '../index';
import { IStack, ArrayStack } from "./stack";
import { Config } from "../config";
import { INamespace } from "generic-metamodel";

let maxlocalID: number = 0;

// TODO: add resolve function (similar to resolve/resolveOne in QVT)

export class Context {
  // TODO: remove multiple stores, add store in constructor
  public readonly storeStack: IStack<ModelStore> = new ArrayStack();
  public readonly modelStack: IStack<g.IModel> = new ArrayStack();
  public readonly namespaceStack: IStack<g.INamespace> = new ArrayStack(); // used to resolve names

  constructor() {

    // TODO : add initial nameaspace using store!
    const topNamespace: INamespace = {
      id : "1",
      name: Config.TOP_NAME_DOMAIN,
      label:Config.TOP_NAME_DOMAIN,
      elements: [],
      path:""
    } as unknown as INamespace;

    this.namespaceStack.push(topNamespace);
  }
  // used to generate unique names, if ommited during creation of model elements
  public get generateID(): string {
    return (++maxlocalID).toString();
  }

  public get store(): ModelStore {
    try {
      return this.storeStack.peek();
    } catch (e: any) {
      throw new Error("No store in the context!");
    }
  }

  public pushStore = (s: ModelStore) => {
    this.storeStack.push(s);
  };

  public popStore = () => {
    this.storeStack.pop();
  };

  public get currentModel(): g.IModel | undefined {
    try {
      return this.modelStack.peek();
    } catch (e: any) {
      return undefined;
    }
  }

  public pushModel = (m: g.IModel) => {
    this.modelStack.push(m);
    // model is also namespace
    this.namespaceStack.push(m);
  };

  public popModel = () => {
    const m = this.modelStack.pop();
    // remove namespacess within the model
    while (this.namespaceStack.peek() != m) {
      this.namespaceStack.pop;
    }
    // model is also namespace
    this.namespaceStack.pop();
  };

  public get currentNamespace(): g.INamespace | undefined {
    try {
      return this.namespaceStack.peek();
    } catch (e: any) {
      return undefined;
    }
  }

  public pushNamespace = (m: g.INamespace) => {
    this.namespaceStack.push(m);
  };

  public popNamespace = () => {
    this.namespaceStack.pop();
  };
}

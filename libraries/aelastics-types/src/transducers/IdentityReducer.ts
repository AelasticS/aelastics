/*
 * Copyright (c) AelasticS 2020.
 */

/**
 *  IdentityReducer do nothing, just return what it receives
 *   init - return the received value without modifications
 *   step - return the received value without modifications
 *   result - return the received value without modifications
 */
import { IProcessor, WhatToDo } from "./Processor";
import { Node } from "../common/Node";

export class IdentityReducer implements IProcessor {
  init(value: any, currNode: Node): [any, WhatToDo] {
    return [value, "continue"];
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    return [result, "continue"];
  }

  step(result: any, currNode: Node, item: any): [any, WhatToDo] {
    return [result, "continue"];
  }
}

/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from "../common/Node";

export type WhatToDo = "continue" | "terminate" | "skipChildren" | "skipChild";

export interface IProcessor {
  init(value: any, currNode: Node, ...args: any[]): [any, WhatToDo];
  result(result: any, currNode: Node, ...args: any[]): [any, WhatToDo];
  step(result: any, currNode: Node, item: any, ...args: any[]): [any, WhatToDo];
}
export type IProcessorConstructor = { new (xfNext: IProcessor, ...args: any[]): IProcessor };

export type Reducer<A> = (result: A, currNode: Node, item: any) => A;

export const compose =
  (...fns: ((y: any) => any)[]) =>
  (x: any) =>
    fns.reduceRight((y, f) => f(y), x);

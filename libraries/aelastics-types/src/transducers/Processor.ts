/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from "../common/Node";

/**
 * Represents possible actions for a processor.
 */
export type WhatToDo = "continue" | "terminate" | "skipChildren" | "skipChild";

/**
 * Represents an interface for a processor.
 */
export interface IProcessor {
  /**
   * Initializes the processor with a value.
   * @param {any} value - The initial value.
   * @param {Node} currNode - The current node.
   * @param {...any} args - Additional arguments.
   * @returns {[any, WhatToDo]} A tuple containing the processed result and the next action.
   */
  init(value: any, currNode: Node, ...args: any[]): [any, WhatToDo];


  /**
   * Handles the result of a processing step.
   * @param {any} result - The result of the previous step.
   * @param {Node} currNode - The current node.
   * @param {...any} args - Additional arguments.
   * @returns {[any, WhatToDo]} A tuple containing the processed result and the next action.
   */
  result(result: any, currNode: Node, ...args: any[]): [any, WhatToDo];

  /**
   * Performs a processing step.
   * @param {any} result - The result of the previous step.
   * @param {Node} currNode - The current node.
   * @param {any} item - The item to process.
   * @param {...any} args - Additional arguments.
   * @returns {[any, WhatToDo]} A tuple containing the processed result and the next action.
   */
  step(result: any, currNode: Node, item: any, ...args: any[]): [any, WhatToDo];
}


export type IProcessorInit = IProcessor["init"]
export type IProcessorStep = IProcessor["step"]
export type IProcessorResult = IProcessor["result"]

/**
 * Represents a constructor type for creating processors.
 */
export type IProcessorConstructor = { new (xfNext: IProcessor, ...args: any[]): IProcessor };


/**
 * Represents a reducer function type used to aggregate or accumulate values.
 * 
 * @template A The type of the accumulator/result.
 * 
 * @param result The accumulated result so far.
 * @param currNode The current element being processed in the reducer.
 * @param item Additional data or context that might be used in the reduction process.
 * 
 * @returns The updated accumulated result after processing the current element.
 */
export type Reducer<A> = (result: A, currNode: Node, item: any) => A;


/**
 * Composes a sequence of functions into a single function.
 * Each function is passed the return value of the preceding function.
 * 
 * @param fns An array of functions to compose.
 * @returns A function that represents the composition of the input functions.
 */
export const compose =
  (...fns: ((y: any) => any)[]) =>
  (x: any) =>
    fns.reduceRight((y, f) => f(y), x);

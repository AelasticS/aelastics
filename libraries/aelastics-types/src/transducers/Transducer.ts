/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from "../common/Node";
import { IProcessor, Reducer, ProcessorClass } from "./Processor";
import { Wrap } from "./Wrap";
import { NaturalReducer } from "./NaturalReducer";
import { IdentityReducer } from "./IdentityReducer";
import { Map } from "./Map";
import { Filter } from "./Filter";
import { ToDTOGraph } from "./ToDTOGraph";
import { FromDTOGraph } from "./FromDTOGraph";
import { Validation } from "./Validation";
import { RecursiveProcessor } from "./RecursiveProcessor";
import { AnnotationProcessor } from "./AnnotationProcessor";
import { AnyAnnotation, TypedAnnotation} from "../annotations/Annotation";
import { NewInstance } from "./NewInstance";
import { StepperReducer } from "./StepperReducer";

export type IMapFun = (item: any, n: Node) => any;

export class Transducer {
  processors: Array<(t: IProcessor) => IProcessor> = [];
  reducer: IProcessor | undefined;

  get composed(): (xf: IProcessor) => IProcessor {
    return (x: any) => this.processors.reduceRight((y, f) => f(y), x);
  }

  doFinally(processor: IProcessor): IProcessor {
    this.reducer = this.composed(processor);
    return this.reducer;
  }

  do(Ctor: ProcessorClass, ...args: any[]): this {
    let tr = (xfNext: IProcessor) => {
      return new Ctor(xfNext, ...args);
    };
    this.processors.push(tr);
    return this;
  }


  // include Processor only if condition is satisfied
  doIf(condition: boolean, Ctor: ProcessorClass, ...args: any[]): this {
    if (condition) {
      let tr = (xfNext: IProcessor) => {
        return new Ctor(xfNext, ...args);
      };
      this.processors.push(tr);
    }
    return this;
  }

  map(f: IMapFun): this {
    return this.do(Map, f);
  }

  recurse(mode: "accumulate" | "makeItem"): this {
    return this.do(RecursiveProcessor, this, mode === "makeItem");
  }

  filter(f: (item: any, currNode: Node) => boolean): this {
    return this.do(Filter, f);
  }

  /**
   * validate some value
   * returns hierarchy of errors
   */
  validate(): this {
    return this.do(Validation);
  }

  /**
   * create a new instance based on initValues as instance template
   * @param initValues
   *
   * example:
   *    tr.create(
   *    { name:'John',
   *      parent: { name:'Tom'}
   *      children:[{name:'Ana}, {name:{Peter}}]
   *    }).Processor().
   *
   */
  newInstance(initValues?: any, generateID?: () => any): this {
    return this.do(NewInstance, initValues, generateID);
  }

  processAnnotations(annot: TypedAnnotation): this {
    return this.do(AnnotationProcessor, annot)
  }

  doWithAnnotations(Ctor: ProcessorClass, ...na:TypedAnnotation[]): this {
    let tr = (xfNext: IProcessor) => {
      return new Ctor(xfNext, ...na);
    };
    this.processors.push(tr);
    return this;
  }


  toDtoGraph(): this {
    return this.do(ToDTOGraph);
  }

  fromDtoGraph(): this {
    return this.do(FromDTOGraph);
  }

  reduce<A>(stepFn: Reducer<A>, initValue: any): IProcessor {
    let wrap = new Wrap(stepFn, initValue);
    return this.doFinally(wrap);
    // this.reducer = this.composed(wrap);
    // return this.reducer;
  }

  count(): IProcessor {
    return this.reduce((acc: number, item: any, currNode) => acc + 1, 0);
  }

  sum(): IProcessor {
    return this.reduce((acc: number, item: any, currNode) => acc + item, 0);
  }
}

export const wrap = (f: (result: any, currNode: Node, item: any) => any) => {
  return new Wrap(f);
};

const nrXF = new NaturalReducer();
export const naturalReducer = (): IProcessor => {
  return nrXF; // new NaturalReducer()
};

const idXF = new IdentityReducer();
export const identityReducer = (): IProcessor => {
  return idXF;
};

const nrStXF = new StepperReducer();
export const stepperReducer = (): IProcessor => {
  return nrStXF;
};

export const map = (f: (currNode: Node) => any): ((xf: IProcessor) => IProcessor) => {
  return function (xf: IProcessor) {
    return new Map(xf, f);
  };
};

/**
 *
 * @param f
 */
export const filter = (
  f: (currNode: Node, item: any) => boolean
): ((xf: IProcessor) => IProcessor) => {
  return function (xf: IProcessor) {
    return new Filter(xf, f);
  };
};

export const validate = (): ((xf: IProcessor) => IProcessor) => {
  return function (xf: IProcessor) {
    return new Validation(xf);
  };
};

// TODO:rename to new() or create()
export const transducer = () => new Transducer();


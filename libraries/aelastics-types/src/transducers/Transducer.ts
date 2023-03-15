/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from "../common/Node";
import { ITransformer, Reducer, TransformerClass } from "./Transformer";
import { Wrap } from "./Wrap";
import { NaturalReducer } from "./NaturalReducer";
import { IdentityReducer } from "./IdentityReducer";
import { Map } from "./Map";
import { Filter } from "./Filter";
import { ToDTOGraph } from "./ToDTOGraph";
import { FromDTOGraph } from "./FromDTOGraph";
import { Validation } from "./Validation";
import { RecursiveTransformer } from "./RecursiveTransformer";
import { AnnotationTransformer } from "./AnnotationTransformer";
import { AnyAnnotation, TypedAnnotation} from "../annotations/Annotation";
import { NewInstance } from "./NewInstance";
import { StepperReducer } from "./StepperReducer";

export type IMapFun = (item: any, n: Node) => any;

export class Transducer {
  transformers: Array<(t: ITransformer) => ITransformer> = [];
  reducer: ITransformer | undefined;

  get composed(): (xf: ITransformer) => ITransformer {
    return (x: any) => this.transformers.reduceRight((y, f) => f(y), x);
  }

  doFinally(transformer: ITransformer): ITransformer {
    this.reducer = this.composed(transformer);
    return this.reducer;
  }

  do(Ctor: TransformerClass, ...args: any[]): this {
    let tr = (xfNext: ITransformer) => {
      return new Ctor(xfNext, ...args);
    };
    this.transformers.push(tr);
    return this;
  }

  // include transformer only if condition is satisfied
  doIf(condition: boolean, Ctor: TransformerClass, ...args: any[]): this {
    if (condition) {
      let tr = (xfNext: ITransformer) => {
        return new Ctor(xfNext, ...args);
      };
      this.transformers.push(tr);
    }
    return this;
  }

  map(f: IMapFun): this {
    return this.do(Map, f);
  }

  recurse(mode: "accumulate" | "makeItem"): this {
    return this.do(RecursiveTransformer, this, mode === "makeItem");
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
   *    }).transformer().
   *
   */
  newInstance(initValues?: any, generateID?: () => any): this {
    return this.do(NewInstance, initValues, generateID);
  }

  processAnnotations(annot: TypedAnnotation): this {
    return this.do(AnnotationTransformer, annot)
  }

  toDtoGraph(): this {
    return this.do(ToDTOGraph);
  }

  fromDtoGraph(): this {
    return this.do(FromDTOGraph);
  }

  reduce<A>(stepFn: Reducer<A>, initValue: any): ITransformer {
    let wrap = new Wrap(stepFn, initValue);
    return this.doFinally(wrap);
    // this.reducer = this.composed(wrap);
    // return this.reducer;
  }

  count(): ITransformer {
    return this.reduce((acc: number, item: any, currNode) => acc + 1, 0);
  }

  sum(): ITransformer {
    return this.reduce((acc: number, item: any, currNode) => acc + item, 0);
  }
}

export const wrap = (f: (result: any, item: any, currNode: Node) => any) => {
  return new Wrap(f);
};

const nrXF = new NaturalReducer();
export const naturalReducer = (): ITransformer => {
  return nrXF; // new NaturalReducer()
};

const idXF = new IdentityReducer();
export const identityReducer = (): ITransformer => {
  return idXF;
};

const nrStXF = new StepperReducer();
export const stepperReducer = (): ITransformer => {
  return nrStXF;
};

export const map = (f: (currNode: Node) => any): ((xf: ITransformer) => ITransformer) => {
  return function (xf: ITransformer) {
    return new Map(xf, f);
  };
};

/**
 *
 * @param f
 */
export const filter = (
  f: (item: any, currNode: Node) => boolean
): ((xf: ITransformer) => ITransformer) => {
  return function (xf: ITransformer) {
    return new Filter(xf, f);
  };
};

export const validate = (): ((xf: ITransformer) => ITransformer) => {
  return function (xf: ITransformer) {
    return new Validation(xf);
  };
};

// TODO:rename to new() or create()
export const transducer = () => new Transducer();


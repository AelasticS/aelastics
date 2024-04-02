/*
 * Copyright (c) 2023 AelasticS
 * Author: Sinisa Neskovic
 */

import * as t from "aelastics-types";
import {
  identityReducer,
  ObjectLiteral,
  stepperReducer,
  transducer,
} from "aelastics-types";

import { AddEventListeners } from "../eventLog/AddEventListenersTransformer";
import { ObjectObservable } from "../eventLog/ObservableTransformer";
import { v4 as uuidv4 } from "uuid";
import { IStoreObject, getUnderlyingType } from "../common/CommonConstants";
import { ServiceError } from "aelastics-result";

let counter: number = 100;

export let uuidv4Generator = () => {
  return uuidv4();
};

export class ImmutableRepository<T extends t.Any, ID = string> {
  readonly props; 
  readonly allInverse;
  constructor (readonly baseType: t.AnyObjectType) {
    this.props = this.baseType.allProperties
    this.allInverse = baseType.allInverse;

  }

  // static create(baseType: t.Any, init?: Partial<t.TypeOf<typeof baseType>>): { [key: string]: any };
  deepCreate<P extends ObjectLiteral>(init?: Partial<P>):IStoreObject<P> {
    // // t.TypeOf<typeof baseType> {
for(let [propName, prop] of this.props) {
    // todo: find base type, skip optional and link types
    let currentPropType: t.Any = getUnderlyingType(prop);
    if (currentPropType === undefined)
      throw new ServiceError(
        'ReferenceError',
        `Error in function handleInverseProps: Property ${propName} in object type ${prop.name} has no correctly defined type`
      );
    let inverse = this.allInverse.get(propName);
}

    // let tr = transducer()
    //   .recurse("makeItem")
    //   .newInstance(init, uuidv4Generator)
    //   .do(ObjectObservable)
    //   .doIf(this.eventLog !== undefined, AddEventListeners, this.eventLog)
    //   .do(HandleProps)
    //   .doFinally(stepperReducer());
    // let obj = baseType.transduce<P>(tr, undefined);
    // // TODO: log creation operation
    // if (this.eventLog) {
    //   this.eventLog.lastAction.objectCreated(
    //     obj as Object,
    //     baseType
    //   );
    //   //  console.log(this.eventLog.getAllActions())
    // }
    let obj = {}
    return obj as IStoreObject<P>;
  }
/*

  create<P extends ObjectLiteral>(baseType: t.ObjectType<any,any>, init?: Partial<P>): IStoreObject<P> {
    let tr = transducer()
      // .recurse('makeItem')
      .newInstance(init, uuidv4Generator)
      .do(ObjectObservable)
      .doIf(this.eventLog !== undefined, AddEventListeners, this.eventLog)
      .do(HandleProps)
      .doFinally(stepperReducer());
    let obj = baseType.transduce<P>(tr, undefined);
    if (this.eventLog) {
      this.eventLog.lastAction.objectCreated(
        obj as Object,
        baseType
      );
      //  console.log(this.eventLog.getAllActions())
    }
    return obj as IStoreObject<P>;
  }

  // detach JPA vs dispose
  exportToDTO(objType: t.ObjectType<any,any>, obj: ObjectLiteral): ObjectLiteral {
    let tr = transducer()
      .recurse("makeItem")
      .toDtoGraph()
      .doFinally(identityReducer());
    let res = objType.transduce<t.DtoGraphTypeOf<typeof objType>>(tr, obj);
    return res;
  }

  // merge JPA
  importFromDTO<P extends ObjectLiteral>(baseType: t.ObjectType<any,any>, inputDTO: ObjectLiteral): IStoreObject<P> {
    let tr = transducer()
      .recurse("makeItem")
      .fromDtoGraph()
      .doFinally(identityReducer());
    let res = baseType.transduce<IStoreObject<P>>(tr,inputDTO);
    return res;
  }

  public delete(
    objectType: t.ObjectType<any, any>,
    obj: t.TypeOf<typeof objectType>
  ) {
    // TODO: log delete operation
    // objectType.deleteInstance(obj)
    objectType.allProperties.forEach((propType: t.Any, propName: string) => {
      let undPropType = getUnderlyingType(propType);
      switch (undPropType.typeCategory) {
        case "Object":
          obj[propName] = undefined;
          break;
        case "Array":
          let arr: Array<any> = obj[propName];
          arr.splice(0, arr.length);
          break;
        case "Map":
          let map: Map<any, any> = obj[propName];
          map.clear();
          break;
        case "Intersection":
        case "TaggedUnion":
        case "Union":
        case "Tuple":
          obj[propName] = undefined;
          break;
      }
    });
    this.eventLog?.lastAction.objectDeleted(obj);
  }
*/

}
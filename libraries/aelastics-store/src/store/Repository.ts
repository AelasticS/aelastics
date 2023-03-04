/*
 * Copyright (c) 2020 AelasticS
 * Author: Sinisa Neskovic
 */

import * as t from "aelastics-types";
import {
  identityReducer,
  ObjectLiteral,
  stepperReducer,
  transducer,
} from "aelastics-types";
import { observable } from "mobx";
import { EventLog } from "../eventLog/EventLog";
import { getUnderlyingType, HandleProps } from "./HandleProps";
import { AddEventListeners } from "../eventLog/AddEventListenersTransformer";
import { ObjectObservable } from "../eventLog/ObservableTransformer";
import { v4 as uuidv4 } from "uuid";
import { IStoreObject } from "./CommonConstants";

let counter: number = 100;

let uuidv4Generator = () => {
  return uuidv4();
};

export class Repository<T extends t.Any, ID = string> {
  readonly eventLog: EventLog | undefined;
  constructor(eventLog?: EventLog) {
    this.eventLog = eventLog;
  }
  // static create(baseType: t.Any, init?: Partial<t.TypeOf<typeof baseType>>): { [key: string]: any };
  deepCreate<P extends ObjectLiteral>(baseType: t.ObjectType<any,any>, init?: Partial<P>):IStoreObject<ID, P> {
    // t.TypeOf<typeof baseType> {

    let tr = transducer()
      .recurse("makeItem")
      .newInstance(init, uuidv4Generator)
      .do(ObjectObservable)
      .doIf(this.eventLog !== undefined, AddEventListeners, this.eventLog)
      .do(HandleProps)
      .doFinally(stepperReducer());
    let obj = baseType.transduce<P>(tr, undefined);
    // TODO: log creation operation
    if (this.eventLog) {
      this.eventLog.lastAction.objectCreated(
        obj as Object,
        baseType
      );
      //  console.log(this.eventLog.getAllActions())
    }
    return obj as IStoreObject<ID, P>;
  }

  create<P extends ObjectLiteral>(baseType: t.ObjectType<any,any>, init?: Partial<P>): IStoreObject<ID, P> {
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
    return obj as IStoreObject<ID, P>;
  }

  exportToDTO(objType: t.ObjectType<any,any>, obj: ObjectLiteral): ObjectLiteral {
    let tr = transducer()
      .recurse("makeItem")
      .toDtoGraph()
      .doFinally(identityReducer());
    let res = objType.transduce<t.DtoGraphTypeOf<typeof objType>>(tr, obj);
    return res;
  }

  importFromDTO<P extends ObjectLiteral>(baseType: t.ObjectType<any,any>, inputDTO: ObjectLiteral): IStoreObject<ID, P> {
    let tr = transducer()
      .recurse("makeItem")
      .fromDtoGraph()
      .doFinally(identityReducer());
    let res = baseType.transduce<IStoreObject<ID, P>>(tr,inputDTO);
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
}

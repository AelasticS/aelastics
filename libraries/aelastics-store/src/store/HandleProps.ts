/*
 * Project: aelastics-store
 * Created Date: Thursday November 3rd 2022
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */


import { ServiceError } from 'aelastics-result';
import * as t from 'aelastics-types';
import { computed, extendObservable, IObservableArray, observe } from 'mobx';
import * as types from 'aelastics-types';
import { StatusValue } from '../common/Status';
import { ITransformer, Node, WhatToDo } from 'aelastics-types';
import { prefixValue, objectStatus, objectSync, getUnderlyingType } from '../common/CommonConstants';

export class HandleProps implements ITransformer {
  private xf: ITransformer;

  constructor(xf: ITransformer) {
    this.xf = xf;
  }

  init(value: any, currNode: Node): [any, WhatToDo] {
    return this.xf.init(value, currNode);
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    switch (currNode.type.typeCategory) {
      case 'Object':
        result = handleProps(result, currNode.type);
        break;
    }
    return this.xf.result(result, currNode);
  }

  step(result: any, currNode: Node, item: any): [any, WhatToDo] {
    return this.xf.step(result, currNode, item);
  }
}



function handleProps(input: types.ObjectLiteral, type: t.Any): types.ObjectLiteral {
  let objectType: types.ObjectType<any, any> = type as any; //ObjectTypeC<{}, any> = type as any
  let output = input;
  const allInverse = objectType.allInverse;

  for (let [propName, prop] of objectType.allProperties) {
    // todo: find base type, skip optional and link types
    let currentPropType: t.Any = getUnderlyingType(prop);
    if (currentPropType === undefined)
      throw new ServiceError(
        'ReferenceError',
        `Error in function handleInverseProps: Property ${propName} in object type ${type.name} has no correctly defined type`
      );
    let inverse = allInverse.get(propName);
    if (inverse === undefined) {
      makePropertyWithNoInverse(output, propName);
    } else {
      switch (currentPropType.typeCategory) {
        case 'Object':
          switch (inverse.propType) {
            case 'Array':
              makeObjectPropInverseToArrayProp(output, propName, inverse.propName);
              break;
            case 'Map':
              makeObjectPropInverseToMapProp(output, propName, inverse.propName);
              break;
            case 'Object':
              makeObjectPropInverseToObjectProp(output, propName, inverse.propName);
              break;
          }
          break;
        case 'Array':
          switch (inverse.propType) {
            case 'Array':
              makeArrayPropInverseToArrayProp(output, propName, inverse.propName);
              break;
            case 'Map':
              throw new ServiceError(
                'FeatureNotSupported',
                `Many-to-many bidirectional relationships not supported:${currentPropType.name}.${propName} and ${inverse.type.name}.${inverse.propName} `
              );
            // makePropertyInverseToMap(input, prop, inverse.prop)
                
            case 'Object':
              makeArrayPropInverseToObjectProp(output, propName, inverse.propName);
              break;
          }
          break;
        case 'Map':
          switch (inverse.propType) {
            case 'Array':
              throw new ServiceError(
                'FeatureNotSupported',
                `Many-to-many bidirectional relationships not supported:${currentPropType.name}.${propName} and ${inverse.type.name}.${inverse.propName} `
              );
            // makePropertyInverseToArray(input, prop, inverse.prop)

            case 'Map':
              throw new ServiceError(
                'FeatureNotSupported',
                `Many-to-many bidirectional relationships not supported:${currentPropType.name}.${propName} and ${inverse.type.name}.${inverse.propName} `
              );
            // makePropertyInverseToArray(input, prop, inverse.prop)

            case 'Object':
              makeInverseMapReadOnly(output, propName);
              break;
          }
          break;
      }
    }
  }
  return output;
}

export function makePropertyWithNoInverse(obj: types.ObjectLiteral, propName: string) {
  extendObservable(obj, {
    [`${prefixValue}${propName}`]: obj[propName],
    get [propName]() {
      if (obj[objectStatus] === StatusValue.Deleted) {
        throw new Error(`Access to deleted object via property '${propName}'`);
      }
      return obj[`${prefixValue}${propName}`];
    },
    set [propName](newValue: any) {
      if (obj[objectStatus] === StatusValue.Deleted) {
        throw new Error(`Access to deleted object via property '${propName}'`);
      }
      obj[`${prefixValue}${propName}`] = newValue;
      if (obj[objectStatus] === StatusValue.Unmodified) obj[objectStatus] = StatusValue.Updated;
    }
  });
}

export function makeArrayPropInverseToObjectProp(
  input: types.ObjectLiteral,
  arrayName: string,
  inversePropName: string
) {
  extendObservable(
    input,
    {
      [`${prefixValue}${arrayName}`]: input[arrayName],
      get [`${arrayName}`]() {
        //        return Object.freeze([...this[`${prefixValue}${arrayName}`]]);
        return input[`${prefixValue}${arrayName}`];
      }
    }
    // {
    //   [`${arrayName}`]: computed
    // }
  );
  observe(input[`${prefixValue}${arrayName}`] as IObservableArray<any>, (change) => {
    // TODO: what about duplicates?

    if (input[objectSync] === true) return;
    input[objectSync] = true;
    switch (change.type) {
      case 'update':
        change.newValue[objectSync] = true;
        let oldValue = change.newValue[`${prefixValue}${inversePropName}`];
        // remove from old object array
        if (oldValue) {
          const index = oldValue[`${prefixValue}${arrayName}`].indexOf(change.newValue, 0);
          if (index > -1) {
            oldValue[objectSync] = true;
            oldValue[`${prefixValue}${arrayName}`].splice(index, 1);
            oldValue[objectSync] = false;
          }
        }
        // set new value
        change.newValue[`${prefixValue}${inversePropName}`] = input;
        change.newValue[objectSync] = false;

        change.oldValue[objectSync] = true;
        change.oldValue[`${prefixValue}${inversePropName}`] = undefined;
        change.oldValue[objectSync] = false;

        break;
      case 'splice':
        change.removed.forEach((el) => {
          el[objectSync] = true;
          el[`${prefixValue}${inversePropName}`] = undefined;
          el[objectSync] = false;
        });
        change.added.forEach((el) => {
          el[objectSync] = true;
          let oldValue = el[`${prefixValue}${inversePropName}`];
          if (oldValue) {
          // remove from old object array
          const index = oldValue[`${prefixValue}${arrayName}`].indexOf(el, 0);
            if (index > -1) {
              oldValue[objectSync] = true;
              oldValue[`${prefixValue}${arrayName}`].splice(index, 1);
              oldValue[objectSync] = false;
            }
          }
          // set new value
          el[`${prefixValue}${inversePropName}`] = input;
          el[objectSync] = false;
        });
        break;
    }
    input[objectSync] = false;
  });
}

export function makeArrayPropInverseToArrayProp(
  input: types.ObjectLiteral,
  arrayName: string,
  inversePropName: string
) {
  extendObservable(
    input,
    {
      [`${prefixValue}${arrayName}`]: input[arrayName],
      get [`${arrayName}`]() {
        //        return Object.freeze([...this[`${prefixValue}${arrayName}`]]);
        return input[`${prefixValue}${arrayName}`];
      }
    }
    // {
    //   [`${arrayName}`]: computed
    // }
  );
  observe(input[`${prefixValue}${arrayName}`] as IObservableArray<any>, (change) => {
    if (input[objectSync] === true) return;
    input[objectSync] = true;

    // TODO: what about duplicates?
    switch (change.type) {
      case 'update':
        let newArray: Array<any> = change.newValue[inversePropName];
        let oldArray: Array<any> = change.oldValue[inversePropName];

        // add to new inverse array
        if (!newArray.includes(input)) {
          change.newValue[objectSync] = true;
          newArray.push(input);
          change.newValue[objectSync] = false;
        }
        // remove from old inverse array
        const index = oldArray.indexOf(input, 0);
        if (index > -1) {
          change.oldValue[objectSync] = true;
          oldArray.splice(index, 1);
          change.oldValue[objectSync] = false;
        }
        break;
      case 'splice':
        // remove from old inverse arrays
        change.removed.forEach((el) => {
          el[objectSync] = true;

          let arr: Array<any> = el[inversePropName];
          const index = arr.indexOf(input, 0);
          if (index > -1) {
            arr.splice(index, 1);
          }
          el[objectSync] = false;
        });
        // add to new inverse arrays
        change.added.forEach((el) => {
          el[objectSync] = true;

          let arr: Array<any> = el[inversePropName];
          if (!arr.includes(input)) {
            arr.push(input);
          }
          el[objectSync] = false;
        });
        break;
    }
    input[objectSync] = false;
  });
}

export function makeInverseMapReadOnly(input: types.ObjectLiteral, arrayName: string) {
  return;
}

export function makeObjectPropInverseToObjectProp(
  obj: types.ObjectLiteral,
  propName: string,
  inversePropName: string
) {
  extendObservable(obj, {
    [`${prefixValue}${propName}`]: obj[propName],

    get [propName]() {
      if (this[objectStatus] === StatusValue.Deleted) {
        throw new Error(`Access to deleted object via property '${propName}'`);
      }
  // @ts-ignore
      return this[`${prefixValue}${propName}`];
    },
    set [propName](newValue: any) {
      if (this[objectStatus] === StatusValue.Deleted) {
        throw new Error(`Access to deleted object via property '${propName}'`);
      }
      if (obj[objectSync] === true) return;
     // obj[objectSync] = true;
      if (this[`${prefixValue}${propName}`] === newValue) return;

      let oldValue = this[`${prefixValue}${propName}`];
      if (this[objectStatus] === StatusValue.Unmodified) this[objectStatus] = StatusValue.Updated;

      this[`${prefixValue}${propName}`] = newValue;
      if (newValue && newValue[`${inversePropName}`] !== this) {
        let oldInverse = newValue[`${prefixValue}${inversePropName}`];
        newValue[objectSync] = true;
        newValue[`${prefixValue}${inversePropName}`] = this;
        newValue[objectSync] = false;

        if (oldInverse) {
          oldInverse[objectSync] = true;
          oldInverse[`${propName}`] = undefined;
          oldInverse[objectSync] = false;
        }
      }
      if (oldValue !== undefined) {
        // ToDo define semantics of ono-to-one bidirectional relationships, hibernate mappedBy
        oldValue[objectSync] = true;
        oldValue[`${inversePropName}`] = undefined;
        oldValue[objectSync] = false;
      }
     // obj[objectSync] = false;
    }
  });
}

export function makeObjectPropInverseToArrayProp(
  obj: types.ObjectLiteral,
  propName: string,
  inverseArrayName: string
) {
  extendObservable(obj, {
    [`${prefixValue}${propName}`]: obj[propName],
    get [propName]() {
      return obj[`${prefixValue}${propName}`];
    },
    set [propName](newValue: any) {
      if (obj[objectSync] === true) return;
     // obj[objectSync] = true;
      if (obj[`${prefixValue}${propName}`] === newValue) return;
      let oldValue = obj[`${prefixValue}${propName}`];
      obj[`${prefixValue}${propName}`] = newValue;
      if (newValue && !newValue[`${prefixValue}${inverseArrayName}`].includes(obj)) {
        newValue[objectSync] = true;
        newValue[`${prefixValue}${inverseArrayName}`].push(obj);
        newValue[objectSync] = false;
      }
      if (oldValue) {
        const index = oldValue[`${prefixValue}${inverseArrayName}`].indexOf(obj, 0);
        if (index > -1) {
          oldValue[objectSync] = true;
          oldValue[`${prefixValue}${inverseArrayName}`].splice(index, 1);
          oldValue[objectSync] = false;
        }
      }
    //  obj[objectSync] = false;
    }
  });
}

export function makeObjectPropInverseToMapProp(
  obj: types.ObjectLiteral,
  propName: string,
  inverseArrayName: string
) {
  // TODO: Map requires that object's ID is known
  return;
}

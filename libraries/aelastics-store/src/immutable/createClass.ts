import {
  Any,
  AnyObjectType,
  ArrayType,
  ObjectLiteral,
} from "aelastics-types";

import { immerable } from "immer";
import { getUnderlyingType } from "../common/CommonConstants";
import {
  defineSimpleValue,
  defineComplexObjectProp,
  defineComplexArrayProp,
  defineManyToMany,
  defineManyToOne,
  defineOneToMany,
  defineOneToOne,
} from "./propCreatorsWithUndo";
import { OperationContext } from "./operation-context";

// 
export type Class<P> = { new(init: Partial<P>): P };

export function createClass<P extends ObjectLiteral>(
  type: AnyObjectType,
  ctx: OperationContext
): Class<P> {
  const props = type.allProperties;
  const inverses = type.allInverse;

  function getElementObjectType(arrTYpe: ArrayType<Any>, mustBeObjectType = false): AnyObjectType {
    const type = getUnderlyingType(arrTYpe.element)
    if (type.typeCategory != "Object" && mustBeObjectType)
      throw new Error(`Element "${type.name}" of array "${arrTYpe.name}" must be object type`)
    return type as AnyObjectType
  }

  class DynamicClass {
    [key: string]: any;
    constructor(init: Partial<P>) {
      // Initialize private properties
      props.forEach((type, propName) => {
        const privatePropName = `_${propName}`;
        if (init[propName])
          this[privatePropName] = init[propName]
        else if (type.typeCategory === 'Array') {
          this[privatePropName] = [];
        } else
          this[privatePropName] = undefined;

      });
    }
  }
  // Define properties
  props.forEach((propType, propName) => {
    if (inverses.has(propName)) {
      // get inverse info
      const inverseDescriptor = inverses.get(propName)!;
      // set local variables
      const { propName: inversePropName, propType: inversePropType, type: inverseObjectType } = inverseDescriptor;
      const propObjectType = propType as AnyObjectType
      const isPropID = propObjectType.isEntity;
      const isInversePropID = inverseObjectType.isEntity;

      // Define the property using the appropriate function based on its type and inverse
      if (propType.typeCategory === 'Object' && inversePropType === 'Object') {
        defineOneToOne(DynamicClass.prototype, propName, inversePropName, propObjectType, inverseObjectType, ctx, isPropID, isInversePropID);
      } else if (propType.typeCategory === 'Object' && inversePropType === 'Array') {
        defineOneToMany(DynamicClass.prototype, propName, inversePropName, propObjectType, inverseObjectType, ctx, isPropID, isInversePropID);
      } else if (propType.typeCategory === 'Array' && inversePropType === 'Object') {
        defineManyToOne(DynamicClass.prototype, propName, inversePropName, propObjectType, inverseObjectType, ctx, isPropID, isInversePropID);
      } else if (propType.typeCategory === 'Array' && inversePropType === 'Array') {
        defineManyToMany(DynamicClass.prototype, propName, inversePropName, propObjectType, inverseObjectType, ctx, isPropID, isInversePropID);
      }
    } else {
      // Define the property without an inverse
      const realPropType = getUnderlyingType(propType)
      if (realPropType.isSimple()) {
        defineSimpleValue(DynamicClass.prototype, propName, realPropType, ctx);
      } else if (realPropType.typeCategory === 'Object') {
        const invType = realPropType as AnyObjectType

        defineComplexObjectProp(DynamicClass.prototype, propName, invType.isEntity, ctx, invType);
      } else if (realPropType.typeCategory === 'Array') {
        const  invType = realPropType as AnyObjectType
        defineComplexArrayProp(DynamicClass.prototype, propName, invType.isEntity, ctx, invType);
      }
    }
  });

  // define id property if it is an entity
  if (type.isEntity) {
    if (type.identifier.length > 1) {
      throw new Error(`Entity type "${type.name}" error - No composite identifier allowed!`)
    }
    const idPropName = type.identifier[0]  // 
    const privatePropName = `_${idPropName}`;
    Object.defineProperty(DynamicClass.prototype, "id", {
      get() {
        return this[privatePropName];
      },
    })
  }
  // Return the dynamically created class with its own name
  Object.defineProperty(DynamicClass, 'name', { value: type.name });
  return DynamicClass as Class<P>
}


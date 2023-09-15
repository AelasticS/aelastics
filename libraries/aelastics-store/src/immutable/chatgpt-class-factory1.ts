import { ServiceError } from "aelastics-result";
import {
  Any,
  AnyObjectType,
  ObjectLiteral,
  ObjectType,
  TypeCategory,
} from "aelastics-types";

import { immerable } from "immer";
import { getUnderlyingType } from "../common/CommonConstants";
import {
  defineSimpleValue,
  defineManyToMany,
  defineManyToOne,
  defineOneToMany,
  defineOneToOne,
  OperationContext,
} from "./propCreatorsWithUndo"; 

export type Class<P> = { new (init: Partial<P>): P };
/*
export function createClass<P extends ObjectLiteral>(
  type: AnyObjectType,
  idMap: Map<any, ObjectLiteral>
): Class<P>{
  const props = type.allProperties;
  const inverses = type.allInverse;

  return class DynamicClass {
    id: string;
    [key: string]: any;

    constructor(init: Partial<P>) {
      // Initialize private properties
      props.forEach((type, propName) => {
        const privatePropName = `_${propName}`;
        if(init[propName])
          this[privatePropName] = init[propName]
        else if (type.typeCategory === 'Array') {
          this[privatePropName] = [];
        } else 
          this[privatePropName] = undefined;
        
      });
      for (const [p, pType] of props) {
        const realPropType: Any = getUnderlyingType(pType);
        const inverse = inverses.get(p);
        if (inverse) {
          inverse.type = getUnderlyingType(pType) as AnyObjectType;
        }

      }

      // Define one-to-one, one-to-many, and many-to-many relationships
      inverses.forEach((inverseDescriptor, propName) => {
        const { inversePropName, propType, objectType } = inverseDescriptor;
        if (propType === 'object') {
          defineOneToOne(this, propName, inversePropName, objectType, idMap);
        } else if (propType === 'array') {
          defineOneToMany(this, propName, inversePropName, objectType, idMap);
          defineManyToMany(this, propName, inversePropName, objectType, idMap);
        }
      });

      // Define properties that don't have inverses
      props.forEach((propDescriptor, propName) => {
        const { type, objectType } = propDescriptor;
        if (!inverses.has(propName)) {
          if (type === 'simple') {
            defineSimpleValue(this, propName);
          } else if (type === 'object') {
            defineOneToOne(this, propName, '', objectType, idMap); // No inverse
          } else if (type === 'array') {
            defineOneToMany(this, propName, '', objectType, idMap); // No inverse
          }
        }
      });
    }
  } ;
}
*/

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

type Class<P> = { new (): P };

export function createClass<P extends ObjectLiteral>(
  type: AnyObjectType,
  idMap: Map<any, ObjectLiteral>
): Class<P> {
  const props = type.allProperties;
  const allInverse = type.allInverse;
  function ConstrFun(this: ObjectLiteral, init: Partial<P>) {
    // init props
    for (const [p, pType] of props) {
      this.p = init?.p;
    }
    // make it compatible with immer
    Object.assign(this, { [immerable]: true });
  }
  // set prototype
  createPrototype(ConstrFun.prototype, props, allInverse, idMap);
  return ConstrFun as any as Class<P>;
}

function OLDcreatePrototype(
  protoObject: {},
  props: Map<string, Any>,
  idMap: Map<any, ObjectLiteral>
) {
  // create getters and setters in the prototype
  for (const [p, pType] of props) {
    const realPropType: Any = getUnderlyingType(pType);
    if (realPropType.typeCategory === "Object") {
      const objType: AnyObjectType = pType as AnyObjectType;
      if (objType.isEntity) {
        Object.defineProperty(protoObject, p, {
          get: function (this: ObjectLiteral) {
            return idMap.get(this[`_${p}`]);
          },
          set: function (this: ObjectLiteral, value: ObjectLiteral) {
            if (objType.identifier.length > 1)
              new ServiceError(
                "FeatureNotSupported",
                `Entity ${objType.name} has complex identifier`
              );
            let id = value[objType.identifier[0]];
            if (this[`_${p}`] !== value[id]) this[`_${p}`] = value[id];
          },
        });
      }
    }
  }
}

function createPrototype(
  protoObject: ObjectLiteral,
  props: Map<string, Any>,
  allInverse: Map<
    string,
    { propName: string; propType: TypeCategory; type: ObjectType<any, []> }
  >,
  idMap: Map<any, ObjectLiteral>
) {
  // create getters and setters in the prototype
  for (const [p, pType] of props) {
    const realPropType: Any = getUnderlyingType(pType);

    if (realPropType.isSimple()) {
    } else {
      const inverse = allInverse.get(p);
      if (inverse) {
        inverse.type = getUnderlyingType(pType) as AnyObjectType;
      }

      switch (realPropType.typeCategory) {
        case "Object":
          const objType: AnyObjectType = realPropType as AnyObjectType;
          if (objType.isEntity) {
            // handle internally as reference
          } else {
            // not entity, handle as normal object reference
          }
        case "Array":
        case "Reference":
        case "TaggedUnion":
        default:
          continue;
      }
    }

    if (realPropType.typeCategory === "Object") {
      const objType: AnyObjectType = realPropType as AnyObjectType;
      if (objType.isEntity) {
        Object.defineProperty(protoObject, p, {
          get: function (this: ObjectLiteral) {
            return idMap.get(this[`_${p}`]);
          },
          set: function (this: ObjectLiteral, value: ObjectLiteral) {
            if (objType.identifier.length > 1)
              new ServiceError(
                "FeatureNotSupported",
                `Entity ${objType.name} has complex identifier`
              );
            let id = value[objType.identifier[0]];
            if (this[`_${p}`] !== value[id]) this[`_${p}`] = value[id];
          },
        });
      }
    }
  }
}

// set property without synchronization

const createAutoRefPropNoInverse = (
  objType: AnyObjectType,
  p: string,
  protoObject: ObjectLiteral,
  idMap: Map<any, ObjectLiteral>
) => {
  if (objType.identifier.length > 1)
    new ServiceError(
      "FeatureNotSupported",
      `Entity ${objType.name} has complex identifier`
    );
  Object.defineProperty(protoObject, p, {
    get: function (this: ObjectLiteral) {
      return idMap.get(this[`_${p}`]);
    },
    set: function (this: ObjectLiteral, value: ObjectLiteral) {
      let id = value[objType.identifier[0]];
      if (this[`_${p}`] !== value[id]) this[`_${p}`] = value[id];
    },
  });
};

const createScalarPropNoInverse = (
  objType: AnyObjectType,
  p: string,
  protoObject: ObjectLiteral,
  idMap: Map<any, ObjectLiteral>
) => {
  Object.defineProperty(protoObject, p, {
    get: function (this: ObjectLiteral) {
      return this[`_${p}`];
    },
    set: function (this: ObjectLiteral, value: any) {
      if (this[`_${p}`] === value) return;
      this[`_${p}`] = value;
    },
  });
};

const createScalarPropWithInverseScalar = (
  objType: AnyObjectType,
  p: string,
  protoObject: ObjectLiteral,
  inverseName: string
) => {
  // define internal prop for setting value without synchronization
  Object.defineProperty(protoObject, `_${p}_SetNoSync`, {
    set: function (this: ObjectLiteral, value: ObjectLiteral) {
      if (this[`_${p}`] === value) return;
      this[`_${p}`] = value;
    },
  });

  // define prop with synchronization
  Object.defineProperty(protoObject, p, {
    get: function (this: ObjectLiteral) {
      return this[`_${p}`];
    },
    set: function (this: ObjectLiteral, value: any) {
      const oldValue = this[`_${p}`];
      this[`_${p}_SetNoSync`] = value;

      if (oldValue) {
        oldValue[`_${inverseName}_SetNoSync`] = undefined;
      }

      if (value) {
        value[`_${inverseName}_SetNoSync`] = this;
      }
    },
  });
};

const createScalarPropWithInverseArray = (
  objType: AnyObjectType,
  p: string,
  protoObject: ObjectLiteral,
  inverseName: string
) => {
  // define internal method for setting value without synchronization
  Object.defineProperty(protoObject, `_${p}_SetNoSync`, {
    set: function (this: ObjectLiteral, value: ObjectLiteral) {
      if (this[`_${p}`] === value) return;
      this[`_${p}`] = value;
    },
  });

  // define prop with synchronization
  Object.defineProperty(protoObject, p, {
    get: function (this: ObjectLiteral) {
      return this[`_${p}`];
    },
    set: function (this: ObjectLiteral, value: any) {
      const oldValue = this[`_${p}`];
      this[`_${p}_SetNoSync`] = value;

      if (oldValue) {
        oldValue[`_remove_${inverseName}_WithoutSync`](this); //
      }

      if (value) {
        value[`_add_${inverseName}_WithoutSync`](this);
      }
    },
  });
};

const createArrayPropWithInverseScalar = (
  objType: AnyObjectType,
  p: string,
  protoObject: ObjectLiteral,
  inverseName: string
) => {
  // define internal methods for adding and removing array elements value without synchronization
  protoObject[`_add_${p}_WithoutSync`] = function (value: ObjectLiteral) {
    const propArray = this[`_${p}`] as ObjectLiteral[];

    if (!propArray.includes(value)) {
      propArray.push(value);
    }
  };
  protoObject[`_remove_${p}_WithoutSync`] = function (value: ObjectLiteral) {
    const propArray = this[`_${p}`] as ObjectLiteral[];

    if (!propArray.includes(value)) {
      this[`_${p}`] = propArray.filter(t => t !== value);
    }
  };

  // define prop with synchronization
  Object.defineProperty(protoObject, p, {
    get: function (this: ObjectLiteral) {
      return this[`_${p}`];
    },
    set: function (this: ObjectLiteral, value: any) {
      const oldValue = this[`_${p}`];
      this[`_${p}_SetNoSync`] = value;

      if (oldValue) {
        oldValue[`_remove_${inverseName}_WithoutSync`](this); //
      }

      if (value) {
        value[`_add_${inverseName}_WithoutSync`](this);
      }
    },
  });
};

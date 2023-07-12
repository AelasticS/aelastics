import { ServiceError } from "aelastics-result";
import { Any, AnyObjectType, ObjectLiteral } from "aelastics-types";
import { immerable } from "immer";

type Class<P> = { new (): P };

export function createClass<P extends ObjectLiteral>(type: AnyObjectType, idMap: Map<any, ObjectLiteral>): Class<P> {
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
  createPrototype(ConstrFun.prototype, props,idMap)
  return ConstrFun as any as Class<P>;
}

function createPrototype(protoObject:{}, props: Map<string, Any>, idMap: Map<any, ObjectLiteral>) {
  // create getters and setters in the prototype
  for (const [p, pType] of props) {
    if (pType.typeCategory === "Object") {
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
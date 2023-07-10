import {ObjectLiteral} from "aelastics-types"
import {immerable} from "immer"

export function createClass(): { new (): ObjectLiteral } {
    const keys = ["name", "age"];
  
    function ConstrFun(this: ObjectLiteral) {
      // make it compatible with immer
      Object.assign(this, { [immerable]: true });
  
      // init props
      for (const key of keys) {
        this[`_${key}`] = key;
      }
    }
  
    // create getters and setters in the prototype
    for (const key of keys) {
      Object.defineProperty(ConstrFun.prototype, key, {
        get: function (this: ObjectLiteral) {
          return this[`_${key}`];
        },
        set: function (this: ObjectLiteral, value: any) {
          if (this[`_${key}`] !== value) this[`_${key}`] = value;
        },
      });
    }
    return ConstrFun as any as { new (): ObjectLiteral };
  }
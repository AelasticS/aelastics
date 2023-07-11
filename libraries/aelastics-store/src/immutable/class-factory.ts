import { Any, AnyObjectType, ObjectLiteral } from "aelastics-types";
import { immerable } from "immer";

type Class<P> = { new(): P };

class ClassFactory<P extends ObjectLiteral> {
  private _protoObject:ObjectLiteral = {}
  private _props:Map<string, Any>
  private _class:Class<P>

  constructor(readonly type:AnyObjectType) {
    this._props = type.allProperties
    this.createPrototype()
    this._class = this.createClass()
  }

  private createPrototype() {
    // create getters and setters in the prototype
    for (const [p, pType] of this._props) {
      if (pType.typeCategory === "Object") {
        Object.defineProperty(this._protoObject, p, {
          get: function (this: ObjectLiteral) {
            return this[`_${p}`];
          },
          set: function (this: ObjectLiteral, value: any) {
            if (this[`_${p}`] !== value) this[`_${p}`] = value;
          },
        });
      }
    }
  }
  
  createClass(): Class<P> {
    const props = this.type.allProperties;
    const allInverse = this.type.allInverse;
    function ConstrFun(this: ObjectLiteral) {
      // make it compatible with immer
      Object.assign(this, { [immerable]: true });
  
      // init props
      for (const [p, pType] of props) {
       // this[`_${p}`] = init?.p;
      }
    }
  
    return ConstrFun as any as Class<P>;
  }
  
}


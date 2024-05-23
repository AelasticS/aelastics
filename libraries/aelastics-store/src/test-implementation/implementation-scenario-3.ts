import { enableMapSet, enablePatches, immerable, produce, produceWithPatches, setAutoFreeze } from "immer"
enablePatches()
enableMapSet()
setAutoFreeze(false) // setting auto freeze to false to avoid the error "Cannot assign to read only property 'parent' of object"

/**
 * This approach will try to centralise the way we instantiate objects
 * and guarantee that get methods inside the entity properties always
 * point to an updated idMap.
 */
export class TestStore {
  private _state: iFoo[]
  private _idMap: Map<string, any>;
  [immerable] = true

  constructor() {
    this._state = []
    this._idMap = new Map()
  }

  newObject(id: string, name: string) {
    const obj = this.createClass(this._idMap)
    const objInstance = new obj({ id, name })
    this._idMap.set(id, objInstance)
    return objInstance
  }

  produce(f: (draft: any) => void) {
    const newState = produce(this._state, (draft: any) => f(draft))
    this._state = newState
  }

  createClass(idMap: Map<string, any>) {
    const parent = "parent"
    const child = "child"
    const privateparent = "_parent"
    const privatechild = "_child"

    class Foo implements iFoo {
      _id: string
      _name: string
      _parent: string | undefined = undefined
      _child: string | undefined = undefined

      constructor(props: { id: string; name: string }) {
        this._id = props.id
        this._name = props.name
      }

      get id(): string {
        return this._id
      }

      get name(): string {
        return this._name
      }

      set name(value: string) {
        this._name = value
      }
    }

    // Define the parent and child properties
    Object.defineProperty(Foo.prototype, "parent", {
      get(): Foo | undefined {
        return this[privateparent] ? idMap.get(this[privateparent]) : undefined
      },
      set(value: Foo | undefined) {
        // Disconnect the old inverse target
        const oldvalue = this[parent]

        if (oldvalue) {
          oldvalue[privatechild] = undefined
        }

        if (value) {
          value[privatechild] = this.id
          this[privateparent] = value.id

          //------ SOLUTION  ATTEMPT 1 ------
          // cannot do this because then we store the proxy of the object in the idmap
          // idMap.set(this.id, this)
          // idMap.set(value?.id, value)
          //------
        } else {
          this[privateparent] = undefined
        }
      },
      enumerable: true,
    })

    Object.defineProperty(Foo.prototype, "child", {
      get(): Foo | undefined {
        return this[privatechild] ? idMap.get(this[privatechild]) : undefined
      },
      set(value: Foo | undefined) {
        // Disconnect the old inverse target
        const oldvalue = this[child]

        if (oldvalue) {
          oldvalue[privateparent] = undefined
        }

        if (value !== undefined) {
          this[privatechild] = value.id
          value[privateparent] = this.id

          //------ SOLUTION ATTEMPT 1 ------
          // cannot do this because then we store the proxy of the object in the idmap
          // idMap.set(this.id, this)
          // idMap.set(value?.id, value)
          //------
        } else {
          this[privatechild] = undefined
        }
      },
      enumerable: true,
    })

    return Foo
  }

  getState() {
    return this._state
  }
}

// The interface for the Foo class
export interface iFoo {
  id: string
  name: string
  parent?: iFoo | undefined
  child?: iFoo | undefined
}

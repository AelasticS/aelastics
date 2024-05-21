import { enablePatches, immerable, produce, produceWithPatches } from "immer"
enablePatches()

// The createClass function creates a class with a parent and child relation
export function createClass(idMap: Map<string, any>) {
  class Foo implements iFoo {
    _id: string
    _name: string
    _parent: string | undefined = undefined
    _child: string | undefined = undefined;
    [immerable] = true

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
  const parent = "parent"
  const child = "child"
  const privateparent = "_parent"
  const privatechild = "_child"

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

// The interface for the Foo class
export interface iFoo {
  id: string
  name: string
  parent?: iFoo | undefined
  child?: iFoo | undefined
}

// The TestStore class where only the state and/or the idMap is mutable
export class TestStore {
  private _state: any[]
  private _idMap: Map<string, any>

  constructor() {
    this._state = []
    this._idMap = new Map()
  }

  createObj(id: string, name: string) {
    const obj = createClass(this._idMap)
    const objInstance = new obj({ id, name })
    this._idMap.set(id, objInstance)
    return objInstance
  }

  produce(f: (draft: any) => void) {
    const newState = produce(this._state, (draft) => f(draft))
    this._state = newState
  }

  produceWithIdMap(f: (draft: any) => void) {
    const [newState, patches] = produceWithPatches({ state: this._state, idMap: this._idMap }, (draft) =>
      f(draft.state)
    )
    this._state = newState.state
    this._idMap = newState.idMap
  }

  //----------------- SOLUTION ATTEMPT 2 -----------------
  /*
  we will try here to update the idmap manually,
  however, what happens when we change name in the nested object??
  */
  produceAndUpdateIdMap(f: (draft: any) => void) {}

  getState() {
    return this._state
  }
}

// The ImmutableTestStore class where the entire class is immutable
export class ImmutableTestStore {
  private _state: any[]
  private _idMap: Map<string, any>;
  [immerable] = true

  constructor() {
    this._state = []
    this._idMap = new Map()
  }

  createObj(id: string, name: string) {
    const obj = createClass(this._idMap)

    const objInstance = new obj({ id, name })
    // Produce an immutable object instance
    const immutableObjInstance = produce(objInstance, (draft) => {})

    // Store the immutable object instance in the map
    this._idMap.set(id, immutableObjInstance)

    return objInstance
  }

  produce(f: (draft: any) => void) {
    return produce(this, (draft) => f(draft.getState()))
  }

  getState() {
    return this._state
  }
}

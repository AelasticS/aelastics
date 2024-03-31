/*
 * Copyright (c) AelasticS 2020.
 */

import { Any } from './DefinitionAPI'

export class VisitedNodes {
  private _counter = 0
  private mapOfTypes: Map<Any, Map<any, any>> = new Map()

  delete([t, i]:[Any, any]): boolean {
    let typeMap = this.mapOfTypes.get(t)
    if (!typeMap) {
      return true
    }
    return typeMap.delete(i)
  }

  clear(): void {
    this.mapOfTypes.clear()
  }

  newID ():number {
    return ++this._counter
  }

  has([t, i]:[Any, any]): boolean {
    let typeMap = this.mapOfTypes.get(t)
    if (!typeMap) return false
    else {
      return typeMap.has(i)
    }
  }
  set([t, i]:[Any, any], n: any): this {
    if(i === undefined)  // ignore undefined as a type instance
      return this
    let typeMap = this.mapOfTypes.get(t)
    if (!typeMap) {
      typeMap = new Map()
      this.mapOfTypes.set(t, typeMap)
    }
    typeMap.set(i, n)
    return this
  }

  get([t, i]:[Any, any]): undefined | any {
    let typeMap = this.mapOfTypes.get(t)
    if (typeMap !== undefined) {
      return typeMap.get(i)
    }
    return undefined
  }

  /*
    -Validate:
    F - Any
    S - any (instance)
    V - any

    -ToDTO:
    F - Any (TypeC<any>)
    S - any (instance input)
    V - InstanceReference (import: complex type)

    -FromDTO:
    F - Any (TypeC<any>)
    S - number (identificator of input, id from input.ref)
    V - any (instance of output)

   */
}

import { TypeC } from './Type'

export type TypeInstancePair<F, S> = [F, S] // [TypeC<any>, any]

export class VisitedNodes<F, S, V> {
  private mapOfTypes: Map<F, Map<S, V>> = new Map<F, Map<S, V>>()

  delete(pair: TypeInstancePair<F, S>): boolean {
    let mapOFInstances = this.mapOfTypes.get(pair[0])
    if (!mapOFInstances) {
      return true
    }
    return mapOFInstances.delete(pair[1])
  }

  clear(): void {
    this.mapOfTypes.clear()
  }

  has(key: TypeInstancePair<F, S>): boolean {
    let mapOFInstances = this.mapOfTypes.get(key[0])
    if (!mapOFInstances) return false
    else {
      return mapOFInstances.has(key[1])
    }
  }
  set(key: TypeInstancePair<F, S>, value: V): this {
    let mapOFInstances = this.mapOfTypes.get(key[0])
    if (!mapOFInstances) {
      mapOFInstances = new Map<S, V>()
      this.mapOfTypes.set(key[0], mapOFInstances)
    }
    mapOFInstances.set(key[1], value)
    return this
  }

  get(key: TypeInstancePair<F, S>): undefined | V {
    let mapOFInstances = this.mapOfTypes.get(key[0])
    if (mapOFInstances !== undefined) {
      return mapOFInstances.get(key[1])
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

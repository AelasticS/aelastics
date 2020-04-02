import { TypeC } from './Type'

export type TypeInstancePair = [TypeC<any>, object]

export class VisitedNodes {
  private mapOfTypes: Map<TypeC<any>, Map<object, object>> = new Map<
    TypeC<any>,
    Map<object, object>
  >()

  delete(pair: TypeInstancePair): boolean {
    let mapOFInstances = this.mapOfTypes.get(pair[0])
    if (!mapOFInstances) {
      return true
    }
    return mapOFInstances.delete(pair[1])
  }

  clear(): void {
    this.mapOfTypes.clear()
  }

  has(pair: TypeInstancePair): boolean {
    let mapOFInstances = this.mapOfTypes.get(pair[0])
    if (!mapOFInstances) return false
    else {
      return mapOFInstances.has(pair[1])
    }
  }
  set(pair: TypeInstancePair): this {
    let mapOFInstances = this.mapOfTypes.get(pair[0])
    if (!mapOFInstances) {
      mapOFInstances = new Map<object, object>()
      this.mapOfTypes.set(pair[0], mapOFInstances)
    }
    mapOFInstances.set(pair[1], pair[1])
    return this
  }
}

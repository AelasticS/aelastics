import { IObjectDescriptor, IObjectLiteral } from './JsonDeserializer'

export class JsonSerializer {
  private visitedNodes: Map<any, any> = new Map<any, any>()
  private counter: number = 0

  /**
   * AJDE :)- Aelsatics JSON Data intErchange format
   *
   *   - each object is given unique serial number
   *   - assign
   */

  /**
   *  serialize object into string
   *
   * @param node
   */
  public serialize(node: IObjectLiteral): string {
    this.visitedNodes.clear()
    const obj = this.normalizeObject(node)
    return JSON.stringify(obj)
  }

  /**
   *  Normalize
   *      preparation for JSON serialization
   *      transforms sets and maps to arrays
   *      add  extra (meta)information to enable deserialization later
   *
   * @param node
   */
  public normalizeObject(node: IObjectLiteral): IObjectLiteral {
    const result = {}
    // add extra meta information
    const ref = this.createObjectDescriptor(node)
    //       this.setNodeType(result, JavascriptType.EntitySchema);
    this.setObjectDescriptor(result, ref)

    // put node in the map of visited objects as a object reference serverType, idName and class serverName)
    this.visitedNodes.set(node, { ...ref, typeOf: 'reference' })

    // traverse all properties
    for (const prop of Object.getOwnPropertyNames(node)) {
      const propResult = this.normalizeAny(node[prop])

      Object.assign(result, { [prop]: propResult })
    }
    // end
    return result
  }

  private normalizeAny(node: any): any {
    // initialize

    switch (typeof node) {
      case 'undefined': // skip
        break
      case 'object':
        if (!this.isVisited(node)) {
          // traverse object recursively

          if (Array.isArray(node)) {
            return this.normalizeArray(node)
          }

          if (node instanceof Set) {
            return this.normalizeSet(node)
          }

          if (node instanceof Map) {
            return this.normalizeMap(node)
          }
          if (node instanceof Date) {
            const d = this.normalizeDate(node)
            return d
          } else {
            // not collection, it is usual object with properties
            return this.normalizeObject(node)
          }
        } else {
          // if visited, get a reference  to it from the visitedNodes
          return this.visitedNodes.get(node)
        }
        break
      case 'boolean':
      // break;
      case 'number':
      // break;
      case 'string':
        return node // value
        break
      case 'function': // skip
      // break;
      default:
        return undefined
    }
  }

  private normalizeArray(array: any[]): IObjectLiteral {
    const newArr: any[] = []
    const ref = this.createObjectDescriptor(array)
    newArr.push(ref)
    for (const elem of array) {
      newArr.push(this.normalizeAny(elem))
    }
    return newArr
  }

  private normalizeMap(map: Map<any, any>): IObjectLiteral {
    // http://2ality.com/2015/08/es6-map-json.html
    const arr: any[] = []

    // setNodeType(arr, JavascriptType.Map);
    // this.setObjectDescriptor(arr, {idName:-1,typeOf:Map.serverName, className:Map.serverName });
    const ref = this.createObjectDescriptor(map)
    arr.push(ref)

    for (const [k, v] of arr) {
      // obj[k] = v; if segment is string
      arr.push([this.normalizeAny(k), this.normalizeAny(v)])
    }
    return arr
  }

  private normalizeSet(ent: Set<any>): IObjectLiteral {
    const set: any[] = []
    // setNodeType(set, JavascriptType.Set);
    // this.setObjectDescriptor(set, {idName:-1,typeOf:Set.serverName, className:Set.serverName });
    const ref = this.createObjectDescriptor(ent)
    set.push(ref)
    for (const e of ent) {
      // obj[k] = v; if segment is string
      set.push(this.normalizeAny(e))
    }
    return set
  }

  private normalizeDate(d: Date): IObjectLiteral {
    let dateObj = { date: d.toString() }
    this.setObjectDescriptor(dateObj, { id: -1, className: 'Date', typeOf: 'object' })
    return dateObj
  }

  private createObjectDescriptor(node: IObjectLiteral): IObjectDescriptor {
    return {
      id: ++this.counter,
      typeOf: typeof node,
      className: node.constructor.name
    }
  }

  private setObjectDescriptor(node: IObjectLiteral, ref?: IObjectDescriptor): IObjectDescriptor {
    if (!ref) {
      ref = this.createObjectDescriptor(node)
    }
    Object.assign(node, { _$_Descr_$: ref })
    return ref
  }

  private isVisited(node: any): boolean {
    return this.visitedNodes.has(node)
  }
}

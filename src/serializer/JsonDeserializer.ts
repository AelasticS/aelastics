import deleteProperty = Reflect.deleteProperty

export interface IObjectType<T> {
  new (id: number, ...args: any[]): T
}

export interface IObjectLiteral {
  [key: string]: any
}

export interface IObjectDescriptor {
  id: number
  typeOf: string
  className: string // used as a class name
}

export class JsonDeserializer {
  private static extractDescriptorFromObject(node: IObjectLiteral): IObjectDescriptor | undefined {
    const ref = node._$_Descr_$
    deleteProperty(node, '_$_Descr_$')
    return ref
  }

  private visitedNodes: Map<any, any> = new Map<any, any>()
  private constrMap: IObjectType<any>[]

  constructor(constr: IObjectType<any>[] = []) {
    this.constrMap = constr
  }

  public deserialize(json: string): IObjectLiteral {
    this.visitedNodes.clear()
    const obj = JSON.parse(json)
    return this.reconstructObject(obj)
  }

  /**
   * Reconstruct original object from serialized normalized object. V
   * his is done in place, by modifying input object
   *
   * @param node  - input object, which is modified to become original
   */
  private reconstructAny(node: any): any {
    let ref: IObjectDescriptor
    switch (typeof node) {
      case 'undefined': // skip
        break
      case 'object':
        if (node.typeOf && node.typeOf === 'reference') {
          const visited = this.visitedNodes.get(node.id)
          if (!visited) {
            throw Error(`Invalid object reference {id: ${node.id}; className:${node.className}}`)
          }
          return visited
        }
        if (Array.isArray(node)) {
          ref = node.shift()
          switch (ref.className) {
            case 'Set':
              return this.reconstructSet(node as any[])
            case 'Array':
              return this.reconstructArray(node as any[])
            case 'Map':
              return this.reconstructMap(node as any[])
            default:
              break
          }
        } else {
          return this.reconstructObject(node)
        }
        break
      case 'boolean':
      // break;
      case 'number':
      // break;
      case 'string':
        return node // value
      // break;
      case 'function': // skip
      // break;
      default:
        return undefined
    }
    return undefined
  }

  private reconstructObject(node: IObjectLiteral): IObjectLiteral {
    const ref = JsonDeserializer.extractDescriptorFromObject(node)
    if (ref && ref.className === 'Date') {
      return new Date(node.date)
    }
    if (ref) {
      // create object
      const newObj = {} // ToDo OPTION: in place reconstruction;

      this.visitedNodes.set(ref.id, newObj) // put in map, so that we can later find it via idName

      // traverse all properties
      for (const prop of Object.getOwnPropertyNames(node)) {
        // @ts-ignore
        newObj[prop] = this.reconstructAny(node[prop])
      }

      this.setPrototype(ref, newObj)

      return newObj
    } else {
      throw Error(
        'Invalid object - has no descriptor. Only objects serialized via JsonSerializer can be deserialized.'
      )
    }
  }

  private setPrototype(ref: IObjectDescriptor, newObj: IObjectLiteral) {
    const ctr: IObjectType<any> | undefined = this.constrMap.find(obj => obj.name === ref.className)
    if (ctr) {
      Object.setPrototypeOf(newObj, ctr.prototype)
    }
  }

  /*    private reconstructDate(d:IObjectDescriptor & {date:string}) : Date {
          const date = new Date(d.date);
          return date;
      }*/

  private reconstructArray(arr: any[]): IObjectLiteral {
    // removeNodeType(arr);
    const newArr: any[] = []
    for (let i = 0; i < arr.length; i++) {
      newArr.push(this.reconstructAny(arr[i]))
    }
    return newArr
  }

  private reconstructSet(arr: any[]): IObjectLiteral {
    // removeNodeType(arr);
    // ToDo check serverType of Set
    const map = new Set<any>()
    for (let i = 0; i < arr.length; i++) {
      map.add(this.reconstructAny(arr[i]))
    }
    return map
  }

  private reconstructMap(arr: Array<{ k: any; v: any }>): IObjectLiteral {
    // removeNodeType(arr);
    // ToDo check serverType of Map
    const map = new Map<any, any>()
    for (let i = 0; i < arr.length; i++) {
      const { k, v } = arr[i]
      map.set(k, this.reconstructAny(v))
    }
    return map
  }
}

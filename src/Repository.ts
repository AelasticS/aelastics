import * as t from './aelastics-types'

function observe(value: any) {}

/**
 * PStore
 * Persistent store defined as Dynamic type, with operations:
 *  create, read, update, delete  which are transactions over store
 *  root Type
 *  each store can have different drivers and connection options
 */

const prepareForReact: t.types.TraversalFunc<any> = (
  type,
  instance,
  currentResult,
  position,
  role,
  extra,
  context
) => {
  switch (type.category) {
    case 'Object':
    case 'Array':
      if (position === 'AfterAllChildren') {
        switch (role) {
          case 'asArrayElement':
          case 'asRoot':
          case 'asProperty':
          case 'asMapKey':
          case 'asMapValue':
            return observe(instance)
          case 'asElementOfTaggedUnion':
          case 'asElementOfUnion':
          case 'asIdentifierPart':
          case 'asIntersectionElement':
          case 'asFuncArgument':
          case 'asReturnType':
            break
        }
      }
      break
    case 'Intersection':
    case 'TaggedUnion':
    case 'Map':
    case 'Date':
    case 'Union':
      break
    // nothing to do
    case 'Function':
    case 'Boolean':
    case 'Literal':
    case 'Null':
    case 'Number':
    case 'String':
    case 'Undefined':
    case 'Void':
      return currentResult
  }
  return currentResult
}

export class Repository<T extends t.Any> {
  static create(baseType: t.Any): t.TypeOf<typeof baseType> {
    let value = baseType.defaultValue()
    //    baseType.traverse(value,) < any >
    return value
  }

  /*

    read():T {
      return this.baseType.defaultValue()
    }

    update(value:T):void {
      return this.baseType.defaultValue()
    }

    delete(value:T):void {
      return this.baseType.defaultValue()
    }

    toJSON(value:T):string {
      return this.baseType.defaultValue()
    }

    fromJSON(value:string):T {
      return this.baseType.defaultValue()
    }

   */
}

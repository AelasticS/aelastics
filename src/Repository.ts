import * as t from './aelastics-types'

/**
 * PStore
 * Persistent store defined as Dynamic type, with operations:
 *  create, read, update, delete  which are transactions over store
 *  root Type
 *  each store can have different drivers and connection options
 */

const prepareForReact: t.types.TraversalFunc<number> = (type, value, c): number => {
  switch (type.category) {
    case 'Object':
    case 'Array':
    case 'Intersection':
    case 'TaggedUnion':
    case 'Map':
    case 'Date':
    case 'Union':
  }
  return 1
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

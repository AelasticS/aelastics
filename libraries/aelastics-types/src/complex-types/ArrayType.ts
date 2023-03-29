import { ComplexType } from './ComplexType'
import { ExtraInfo, Type } from '../type/Type'
import { Any, DtoGraphTypeOf, DtoTreeTypeOf, TypeOf } from '../common/DefinitionAPI'
import { Node } from '../common/Node'
import { InstanceReference } from '../type/TypeDefinisions'
import { TypeSchema } from '../type/TypeSchema'

export class ArrayType<E extends Any> extends ComplexType<
  Array<TypeOf<E>>,
  { ref: InstanceReference; array?: Array<DtoGraphTypeOf<E>> },
  Array<DtoTreeTypeOf<E>>
> {
  readonly element: E

  constructor(name: string, element: E, schema: TypeSchema) {
    super(name, 'Array', schema)
    this.element = element
  }

  init(n: Node): Array<TypeOf<E>> {
    return []
  }

  addChild(parent: Array<any>, child: any, n: Node): void {
    if (n.extra.index !== undefined)
      //     parent[n.extra.index] = child;
      parent.push(child)
  }

  *children(inputArray: Array<TypeOf<E>>, n: Node): Generator<[Array<TypeOf<E>>, Any, ExtraInfo]> {
    if(n.typeLevel)
      // return type of elements 
       yield [undefined as any, this.element, { role: 'asArrayElement', index: -1 }]

    else if (inputArray === undefined || inputArray.length === 0) {
        //  no instance elements
    } else 
      for (let i = 0; i < inputArray.length; i++)  // iterate over instance elements of the array
        yield [inputArray[i], this.element, { role: 'asArrayElement', index: i }]
  }
}

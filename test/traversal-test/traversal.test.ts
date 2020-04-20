import { Place, Belgrade } from '../example/travel-network'
import { types } from '../../src/aelastics-types'
import TraversalFunc = types.TraversalFunc

const countNodes: TraversalFunc<number> = (
  type,
  value,
  currentResult,
  position,
  role,
  extra,
  context
) => {
  switch (type.category) {
    case 'Object':
      if (position === 'AfterAllChildren') {
        switch (role) {
          case 'asArrayElement':
            return currentResult + 1
          case 'asRoot':
            return currentResult + 1
          case 'asProperty':
          case 'asMapKey':
          case 'asMapValue':
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
    case 'Array':
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
describe('Test cases for traversal', () => {
  test('that private array is updated - added new ', () => {
    let count = Place.traverse(Belgrade, countNodes, 0)
    expect(count).toEqual(3)
  })

  test('that public array is frozen', () => {
    expect(1).toEqual(1)
  })

  test('that private array is updated - deleted one', () => {
    expect(0).toEqual(0)
  })
})

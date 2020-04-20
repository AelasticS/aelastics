import { Place, Belgrade } from '../example/travel-network'
import { types } from '../../src/aelastics-types'
import TraversalFunc = types.TraversalFunc

interface Counters {
  AfterAllChildren: number
  BeforeChildren: number
  AfterChild: number
}

const countNodes: TraversalFunc<Counters> = (
  type,
  value,
  currentResult,
  position,
  role,
  extra,
  context
) => {
  if (type.category === 'Object') {
    if (position === 'BeforeChildren') {
      switch (role) {
        case 'asArrayElement':
        case 'asRoot':
          currentResult.BeforeChildren += 1
      }
    }
    if (position === 'AfterChild') {
      switch (role) {
        case 'asArrayElement':
        case 'asRoot':
          currentResult.AfterChild += 1
      }
    }
    if (position === 'AfterAllChildren') {
      switch (role) {
        case 'asArrayElement':
        case 'asRoot':
          currentResult.AfterAllChildren += 1
      }
    }
  }
  console.log(
    `${type.category}:${role}:${value.name}, position:${position}, counter:${JSON.stringify(
      currentResult
    )}`
  )
  return currentResult
}

describe('Test cases for traversal', () => {
  test('that objects in cyclic graph are visited exactly once', () => {
    let count = Place.traverse(Belgrade, countNodes, {
      AfterChild: 0,
      AfterAllChildren: 0,
      BeforeChildren: 0
    })
    expect(count.AfterAllChildren).toEqual(4)
  })
})

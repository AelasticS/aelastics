import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/common/Type'
import {
  recursiveIntersection,
  secondLevelIntersectionObject
} from '../../example/recursive-example'

let i1: t.DtoTypeOf<typeof recursiveIntersection> = {
  ref: { id: 1, category: 'Intersection', typeName: 'recursiveIntersection' },
  intersection: {
    ref: { id: 2, category: 'Object', typeName: '' },
    object: {
      a: {
        ref: { id: 3, category: 'Object', typeName: 'secondLevelIntersectionObject' },
        object: {
          a: undefined,
          b: true,
          c: 'A'
        }
      },
      b: 'A'
    }
  }
}

let i2: t.DtoTypeOf<typeof recursiveIntersection> = {
  ref: { id: 4, category: 'Intersection', typeName: 'recursiveIntersection' },
  intersection: {
    ref: { id: 5, category: 'Object', typeName: '' },
    object: {
      a: {
        ref: { id: 6, category: 'Object', typeName: 'secondLevelIntersectionObject' },
        object: {
          a: undefined,
          b: true,
          c: 'B'
        }
      },
      b: 'B'
    }
  }
}

let i3: t.DtoTypeOf<typeof recursiveIntersection> = {
  ref: { id: 7, category: 'Intersection', typeName: 'recursiveIntersection' },
  intersection: {
    ref: { id: 8, category: 'Object', typeName: '' },
    object: {
      a: {
        ref: { id: 9, category: 'Object', typeName: 'secondLevelIntersectionObject' },
        object: {
          a: undefined,
          b: true,
          c: 'C'
        }
      },
      b: 'C'
    }
  }
}

describe('Testing fromDTOgraph for IntersectionType', () => {
  it('Should be valid for examples.recursiveIntersection type', () => {
    i1.intersection.object.a.object.a = i2
    // i2.intersection.object.a.object.a=i3

    let res = recursiveIntersection.fromDTOgraph(i1)

    if (isSuccess(res)) {
      expect(res.value).toEqual({
        a: {
          a: {
            a: {
              a: undefined,
              b: true,
              c: 'B'
            },
            b: 'B'
          },
          b: true,
          c: 'A'
        },
        b: 'A'
      })
    }
  })

  it('Should be valid for cyclic example  ', () => {
    i1.intersection.object.a.object.a = undefined

    i2.intersection.object.a.object.a = i2

    let res = recursiveIntersection.fromDTOgraph(i2)
    if (isSuccess(res)) {
      expect(res.value).toEqual((i2 as any) as t.TypeOf<typeof recursiveIntersection>)
    }
  })

  it('Should be valid for loop', () => {
    i2.intersection.object.a.object.a = undefined

    i1.intersection.object.a.object.a = i2
    i2.intersection.object.a.object.a = i3
    i3.intersection.object.a.object.a = i1

    let res = recursiveIntersection.fromDTOgraph(i3)

    if (isSuccess(res)) {
      expect(res.value.a.a).toEqual((i1 as any) as t.TypeOf<typeof recursiveIntersection>)
    }
  })

  it('Should be invalid if input is tree structure', () => {
    i1.intersection.object.a.object.a = undefined
    i2.intersection.object.a.object.a = undefined
    i3.intersection.object.a.object.a = undefined

    i1.intersection.object.a.object.a = i2
    i2.intersection.object.a.object.a = i3
    i3.intersection.object.a.object.a = i1

    let res = recursiveIntersection.fromDTOtree(
      (i1 as any) as t.DtoTreeTypeOf<typeof recursiveIntersection>
    )
    expect(isSuccess(res)).toBeFalsy()
  })
})

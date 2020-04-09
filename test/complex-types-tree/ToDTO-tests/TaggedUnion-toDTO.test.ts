// import * as examples from '../testing-types'
// import { isSuccess } from 'aelastics-result'
// import * as t from '../../../src/aelastics-types'
//
// describe('toDTO test cases for TaggedUnion', () => {
//   it('Testing if valid doctor will serialize into dto of employee type', () => {
//     const doc: t.TypeOf<typeof examples.doctorType> = {
//       profession: 'doctor',
//       specialization: true,
//       worksAt: 'Prinston plainsbro'
//     }
//     const res = examples.employeeType.toDTO(doc)
//     if (isSuccess(res)) {
//       expect(res.value).toEqual({
//         profession: 'doctor',
//         specialization: true,
//         worksAt: 'Prinston plainsbro'
//       })
//     }
//   })
//   it('Testing if valid lawyer will serialize into dto of employee type', () => {
//     const doc: t.TypeOf<typeof examples.lawyerType> = {
//       profession: 'lawyer',
//       masterDegree: true,
//       worksAt: 'Goliath National Bank'
//     }
//     const res = examples.employeeType.toDTO(doc)
//     if (isSuccess(res)) {
//       expect(res.value).toEqual({
//         profession: 'lawyer',
//         masterDegree: true,
//         worksAt: 'Goliath National Bank'
//       })
//     }
//   })
//   it('Testing if invalid lawyer will serialize into dto of employee type', () => {
//     const doc: t.TypeOf<typeof examples.lawyerType> = {
//       profession: 'lawyer',
//       masterDegree: true,
//       worksAt: ''
//     }
//     const res = examples.employeeType.toDTO(doc)
//     expect(isSuccess(res)).toBe(false)
//   })
//   it('Testing if invalid lawyer will serialize into dto of employee type(validation=false)', () => {
//     const doc: t.TypeOf<typeof examples.lawyerType> = {
//       profession: 'lawyer',
//       masterDegree: true,
//       worksAt: ''
//     }
//     const res = examples.employeeType.toDTO(doc, [], false)
//     expect(isSuccess(res)).toBe(true)
//   })
//   it('', () => {
//     const t1 = t.object({
//       a: t.literal('a'),
//       b: t.literal(3)
//     })
//     const t2 = t.object({
//       a: t.literal('b'),
//       c: t.string
//     })
//
//     try {
//       const type = t.taggedUnion({ t1, t2 }, 'b')
//       let ty1: t.TypeOf<typeof t1> = {
//         a: 'a',
//         b: 3
//       }
//       expect(isSuccess(type.toDTO(ty1)))
//
//       // tslint:disable-next-line:no-empty
//     } catch (error) {}
//   })
// })

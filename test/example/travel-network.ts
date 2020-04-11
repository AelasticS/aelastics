import * as t from '../../src/aelastics-types'
import { Result } from 'aelastics-result'
import { ConversionOptions, defaultConversionOptions } from '../../src/common/Type'

export const TravelSchema = t.schema('TravelSchema')

export const Place = t.object(
  {
    name: t.string,
    neighbor: t.arrayOf(t.link(TravelSchema, 'Place'))
  },
  'Place',
  TravelSchema
)
TravelSchema.validate()

export type IPlace = t.TypeOf<typeof Place>
export type IPlaceGraph = t.DtoTypeOf<typeof Place>
export type IPlaceTree = t.DtoTreeTypeOf<typeof Place>

export const NoviSad: t.TypeOf<typeof Place> = {
  name: 'Novi Sad',
  neighbor: []
}
export const Belgrade: IPlace = {
  name: 'Belgrade',
  neighbor: [NoviSad]
}
export const Nis: t.TypeOf<typeof Place> = {
  name: 'Nis',
  neighbor: [Belgrade]
}
export const Kraljevo: t.TypeOf<typeof Place> = {
  name: 'Kraljevo',
  neighbor: [Nis, Belgrade]
}

NoviSad.neighbor.push(Belgrade)
Belgrade.neighbor.push(Kraljevo, Nis)
Nis.neighbor.push(Kraljevo)

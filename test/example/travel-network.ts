import * as t from '../../src/aelastics-types'

export const TravelSchema = t.schema('TravelSchema')

export const Place = t.object(
  {
    name: t.string,
    neighbor: t.arrayOf(t.link(TravelSchema, 'Place'))
  },
  'Place',
  TravelSchema
)

export const Zrenjanin: t.TypeOf<typeof Place> = {
  name: 'Zrenjanin',
  neighbor: []
}
export const StaraPazova: t.TypeOf<typeof Place> = {
  name: 'Stara Pazova',
  neighbor: []
}
export const NoviSad: t.TypeOf<typeof Place> = {
  name: 'Novi Sad',
  neighbor: [Zrenjanin, StaraPazova]
}
export const Belgrade: t.TypeOf<typeof Place> = {
  name: 'Belgrade',
  neighbor: []
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
Belgrade.neighbor.push(Kraljevo, Nis, Zrenjanin, NoviSad, StaraPazova)
Nis.neighbor.push(Kraljevo)
StaraPazova.neighbor.push(NoviSad, Belgrade)
Zrenjanin.neighbor.push(Belgrade, NoviSad)

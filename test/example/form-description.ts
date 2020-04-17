import * as t from '../../src/aelastics-types'

export const FormSchema = t.schema('FormSchema')

export const Element = t.object(
  {
    type: t.link(FormSchema, 'ElementType'),
    composition: t.arrayOf(t.link(FormSchema, 'Element')),
    // valuesOfProperty: t.mapOf(t.link(FormSchema, 'PropertyType'), t.link(FormSchema, 'PropertyValue'))
    valuesOfProperty: t.mapOf(t.number, t.link(FormSchema, 'PropertyValue'))
    // valuesOfProperty: t.arrayOf(t.link(FormSchema, 'PropertyValue'))
  },
  'Element',
  FormSchema
)

export const PropertyType = t.object(
  {
    propertyId: t.number,
    propertyName: t.string
    // values: t.link(FormSchema, 'PropertyValue')
  },
  'PropertyType',
  FormSchema
)

export const ElementType = t.object(
  {
    typeId: t.number,
    typeName: t.string,
    // properties: t.mapOf(t.number, PropertyType, 'Properties')
    properties: t.arrayOf(PropertyType)
  },
  'ElementType',
  FormSchema
)

export const PropertyValue = t.object(
  {
    rb: t.number,
    value: t.unionOf([t.number, t.string], 'value'),
    propertyType: t.link(FormSchema, 'PropertyType')
  },
  'PropertyValue',
  FormSchema
)

FormSchema.validate()

// export const Label: t.TypeOf<typeof ElementType> = {
//   typeId: 1,
//   typeName: 'Label',
//   properties: new Map([
//     [1, { propertyId: 1, propertyName: 'Width', values: 5.5 }],
//     [2, { propertyId: 2, propertyName: 'Hight', values: 2.5 }],
//     [3, { propertyId: 3, propertyName: 'Text', values: 'First name' }]
//   ])
// }

export const Width: t.TypeOf<typeof PropertyType> = {
  propertyId: 1,
  propertyName: 'Width'
}
export const Hight: t.TypeOf<typeof PropertyType> = {
  propertyId: 2,
  propertyName: 'Hight'
}
export const Text: t.TypeOf<typeof PropertyType> = {
  propertyId: 3,
  propertyName: 'Text'
}
export const Font: t.TypeOf<typeof PropertyType> = {
  propertyId: 4,
  propertyName: 'Font'
}
export const FontColor: t.TypeOf<typeof PropertyType> = {
  propertyId: 5,
  propertyName: 'Font color'
}
export const Background: t.TypeOf<typeof PropertyType> = {
  propertyId: 6,
  propertyName: 'Background'
}
export const Border: t.TypeOf<typeof PropertyType> = {
  propertyId: 7,
  propertyName: 'Border'
}
export const Label: t.TypeOf<typeof ElementType> = {
  typeId: 1,
  typeName: 'Label',
  properties: [Width, Hight, Text, Font, FontColor]
}

export const Button: t.TypeOf<typeof ElementType> = {
  typeId: 2,
  typeName: 'Button',
  properties: [Width, Hight, Text, Background]
}

export const Panel: t.TypeOf<typeof ElementType> = {
  typeId: 3,
  typeName: 'Panel',
  properties: [Width, Hight, Background, Border]
}
export const PasswordLabel: t.TypeOf<typeof Element> = {
  type: Label,
  composition: [],
  valuesOfProperty: new Map([
    [1, { rb: 1, value: 8.5, propertyType: Label.properties[0] }],
    [2, { rb: 2, value: 2.0, propertyType: Label.properties[1] }],
    [3, { rb: 3, value: 'Password', propertyType: Label.properties[2] }]
  ])
}

export const UsernameLabel: t.TypeOf<typeof Element> = {
  type: Label,
  composition: [],
  valuesOfProperty: new Map([
    [1, { rb: 1, value: 5.5, propertyType: Label.properties[0] }],
    [2, { rb: 2, value: 2.5, propertyType: Label.properties[1] }],
    [3, { rb: 3, value: 'Username', propertyType: Label.properties[2] }]
  ])
}

export const ButtonOK: t.TypeOf<typeof Element> = {
  type: Button,
  composition: [],
  valuesOfProperty: new Map([
    [1, { rb: 1, value: 5.5, propertyType: Button.properties[0] }],
    [2, { rb: 2, value: 1.0, propertyType: Button.properties[1] }],
    [3, { rb: 3, value: 'OK', propertyType: Button.properties[2] }]
  ])
}

export const mainPanel: t.TypeOf<typeof Element> = {
  type: Panel,
  composition: [UsernameLabel, PasswordLabel, ButtonOK],
  valuesOfProperty: new Map([
    [1, { rb: 1, value: 12.5, propertyType: Panel.properties[0] }],
    [2, { rb: 2, value: 10.5, propertyType: Panel.properties[1] }]
  ])
}

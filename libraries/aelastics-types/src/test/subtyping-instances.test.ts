/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../common/DefinitionAPI'
import { isSuccess } from 'aelastics-result'

const FileSchema = t.schema('FileSchema')
// t.setDefaultSchema(FileSchema)

const Item = t.object(
  {
    name: t.string, // .derive().maxLength(128),
    //   creationDate: t.date
    parentDirectory: t.optional(t.link(FileSchema, 'Directory'))
  },
  'Item',
  FileSchema
)

export const File = t.subtype(
  Item,
  {
    fileType: t.string,
  },
  'File',
  FileSchema
)

export const Directory = t.subtype(
  Item,
  {
    items: t.arrayOf(Item,"Items"),
  },
  'Directory',
  FileSchema
)



export const myFile: t.TypeOf<typeof File> = {
  name: 'myFile',
  //  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  fileType: 'txt'
}

const myFileTemplate = {
  "name": "myFile",
  "fileType": "txt",
  "@@aelastics/type" : "/DefaultSchema/FileSchema/File"
}

const myFileDtoGraph = {
  "ref": {
    "typeName": "/DefaultSchema/FileSchema/File",
    "category": "Object",
    "id": 1
  },
  "object": {
    "name": "myFile",
    "fileType": "txt"
  }
}

export const subFolder: t.TypeOf<typeof Directory> = {
  name: 'subFolder',
  //  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  items: [],
}
export const subFolder2: t.TypeOf<typeof Directory> = {
  name: 'Subfolder 2',
  parentDirectory : undefined,
  items: [],
}

export const subFolder2DtoGraph: t.DtoGraphTypeOf<typeof Directory> = {
  ref: { category: '', typeName: 'Folder', id: 1 },
  object: {
    name: 'Subfolder 2',
    parentDirectory : undefined,
    items: { ref:{category: 'Array', typeName: 'Items', id: 2},array:[] },
  },
}

export const rootFolder: t.TypeOf<typeof Directory> = {
  name: 'rootFolder',
  //  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  items: [subFolder, myFile],
}



describe('Tests for subtyping - same schema types', () => {
  it('should convert to DTO graph with concrete subtype specified', () => {
    let myFile1:any = Item.createInstance(myFileTemplate)
    expect(myFile1["@@aelastics/type"]).toEqual("/DefaultSchema/FileSchema/File")

  })

  it('should convert to DTO graph', () => {
    let myFile1 = Item.toDtoGraph(myFileTemplate as any)
    expect(myFile1.ref.typeName).toEqual("/DefaultSchema/FileSchema/File")
  })


  it('should convert from DTO graph with concrete subtype specified', () => {
    let myFile1:any = Item.fromDtoGraph(myFileDtoGraph as any)
    expect(myFile1["@@aelastics/type"]).toEqual("/DefaultSchema/FileSchema/File")
  })
  /*
  it('should convert to DTO graph with concrete subtype specified', () => {
    let res = Directory.toDTOgraph(rootFolder, { typeInfoEnumerable: true })
    expect(isSuccess(res)).toBeTruthy()
    if (isSuccess(res)) {
      let dtoRootFolder: t.DtoTypeOf<typeof Directory> = res.value
      expect(getTypeInfo(dtoRootFolder)).toEqual('Directory')
    }
  })

  it('should convert to DTO tree with concrete subtype specified', () => {
    let res = Directory.toDTOtree(rootFolder, { typeInfoEnumerable: true })
    expect(isSuccess(res)).toBeTruthy()
    if (isSuccess(res)) {
      let dtoRootFolder: t.DtoTreeTypeOf<typeof Directory> = res.value
      expect(getTypeInfo(dtoRootFolder)).toEqual('Directory')
    }
  })

  it('should convert from DTO tree with concrete subtype specified', () => {
    let res = Directory.fromDTOtree(objDtoTree as any, { typeInfoEnumerable: true })
    expect(isSuccess(res)).toBeTruthy()
    if (isSuccess(res)) {
      let rootFolder: t.TypeOf<typeof Directory> = res.value
      expect(getTypeInfo(rootFolder)).toEqual('Directory')
    }
  })

  it('should convert from DTO graph with concrete subtype specified', () => {
    let res = Directory.fromDTOgraph(objDtoGraph as any, { typeInfoEnumerable: true })
    expect(isSuccess(res)).toBeTruthy()
    if (isSuccess(res)) {
      let rootFolder: t.TypeOf<typeof Directory> = res.value
      expect(getTypeInfo(rootFolder)).toEqual('Directory')
    }
  })
  */
})

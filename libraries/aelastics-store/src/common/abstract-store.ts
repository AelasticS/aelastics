/*
 * Project: aelastics-store
 * Created Date: Saturday September 16th 2023
 * Author: Sinisa Neskovic <https://github.com/Sinisa-Neskovic>
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (<https://github.com/Sinisa-Neskovic>)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 * -----
 * HISTORY:
 */




import * as t from "aelastics-types";
import { IStoreObject, objectType } from "./CommonConstants";

export abstract class AbstractStore {
  public readonly schemas: Map<string, t.TypeSchema> = new Map();


  registerTypeSchema(schema: t.TypeSchema) {
    if (!this.schemas.has(schema.absolutePathName))
      this.schemas.set(schema.absolutePathName, schema);
  }

  protected getTypeSchemaName<T extends IStoreObject<t.ObjectLiteral>>(
    obj: T
  ): string {
    return obj[objectType].substring(0, obj[objectType].lastIndexOf("/"));
  }

  protected getTypeSchemaOfObject<T extends IStoreObject<t.ObjectLiteral>>(
    obj: T
  ): t.TypeSchema {
    const schemaName = this.getTypeSchemaName(obj);
    const schema = this.schemas.get(schemaName);
    if (!schema) throw new Error(`Type schema '${schemaName}' does not exist`);
    return schema;
  }
  
  public getType<T extends IStoreObject<t.ObjectLiteral>>(obj: T): t.ObjectType<any,any> {
    const typeName = obj[objectType].substring(
      obj[objectType].lastIndexOf("/") + 1
    );
    const schema = this.getTypeSchemaOfObject(obj);
    const type = schema._types.get(typeName);
    if (!type)
      throw new Error(
        `Object type '${typeName}' does not exist in schema '${schema.name}'`
      );
    return type as  t.ObjectType<any,any>;
  }


    /**
   *  clear store - reset store to be empty
   */
    public abstract clear(clearSchema?:boolean):void;
}

/*
 * Copyright (c) 2020 AelasticS
 * Author: Sinisa Neskovic
 */

import * as t from "aelastics-types";
import { Repository } from "./Repository";
import { EventLog } from "../eventLog/EventLog";
import { ServerProxy } from "../server-proxy/ServerProxy";
import { InstanceReference, ObjectLiteral } from "aelastics-types";
import { IStoreObject, objectType, objectUUID } from "./CommonConstants";

/**
 * Store - application state consisting of several instances (IStoreObject)
 */

/**
 *
 */
export class Store<ID> {
  public readonly schemas: Map<string, t.TypeSchema> = new Map();
  public eventLog = new EventLog();
  protected repo: Repository<any, ID> = new Repository(this.eventLog);
  protected server?: ServerProxy;
  protected readonly instances: Map<ID, IStoreObject<ID, ObjectLiteral>> =
    new Map();

  constructor(server?: ServerProxy) {
    this.server = server;
  }

  registerTypeSchema(schema: t.TypeSchema) {
    if (!this.schemas.has(schema.absolutePathName))
      this.schemas.set(schema.absolutePathName, schema);
  }

  protected getTypeSchemaName<T extends IStoreObject<ID, ObjectLiteral>>(
    obj: T
  ): string {
    return obj[objectType].substring(0, obj[objectType].lastIndexOf("/"));
  }

  protected getTypeSchema<T extends IStoreObject<ID, ObjectLiteral>>(
    obj: T
  ): t.TypeSchema {
    const schemaName = this.getTypeSchemaName(obj);
    const schema = this.schemas.get(schemaName);
    if (!schema) throw new Error(`Type schema '${schemaName}' does not exist`);
    return schema;
  }

  /**
   *  clear all instances and event log
   */
  public clear() {
    this.instances.clear();
    this.eventLog = new EventLog();
    this.repo = new Repository();
  }

  public getObjectByID<T extends IStoreObject<ID, ObjectLiteral>>(id: ID): T | undefined {
    return this.instances.get(id) as T | undefined;
  }

  public async fetchObjectByID(
    type: t.Any,
    id: ID
  )  {
    // read from server
    // deseralize
    // add to this.instances
    return this.getObjectByID(id);
  }

  public async persist() {}

  public create<P extends ObjectLiteral>(
    type: t.Any,
    initValue?: Partial<P>
  ): IStoreObject<ID, P> {
    const obj = this.repo.create<P>(type, initValue);
    return obj;
  }

  public deepCreate<T extends t.ObjectLiteral>(
    type: t.Any,
    initValue: Partial<T>
  ): IStoreObject<ID, T> {
    this.registerTypeSchema(type.ownerSchema);
    const obj = this.repo.deepCreate<T>(type, initValue);
    this.add(obj);
    return obj;
  }

  public add<T extends IStoreObject<ID, ObjectLiteral>>(obj: T) {
    if ("id" in obj) {
      (obj as any)["id"] = obj[objectUUID];
      if (this.instances.has(obj.id))
        throw new Error(
          `MultiStore.add: duplicate id:${obj.id} for object name:"${obj.name}"`
        );
      this.instances.set(obj.id, obj);
    } else this.instances.set(obj[objectUUID], obj);
  }

  public remove<T extends t.ObjectLiteral>(obj: T) {
    // TODO: check if can be removed
    this.instances.delete(obj[objectUUID]);
  }

  public delete<T extends IStoreObject<ID, ObjectLiteral>>(object: T): void {
    let type = this.getType(object);
    if (type.typeCategory !== "Object")
      throw new Error(`You cannot delete typeCategory ${type.typeCategory}`);
    const obj = this.repo.delete(type as t.ObjectType<any, any>, object as any);
  }

  public getType<T extends IStoreObject<ID, ObjectLiteral>>(obj: T): t.Any {
    const typeName = obj[objectType].substring(
      obj[objectType].lastIndexOf("/") + 1
    );
    const schema = this.getTypeSchema(obj);
    const type = schema._types.get(typeName);
    if (!type)
      throw new Error(
        `Object type '${typeName}' does not exist in schema '${schema.name}'`
      );
    return type;
  }
}

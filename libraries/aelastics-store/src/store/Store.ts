/*
 * Project: aelastics-store
 * Created Date: Saturday November 12th 2022
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */

import * as t from "aelastics-types";
import { Repository } from "./Repository";
import { EventLog } from "../eventLog/EventLog";
import { ServerProxy } from "../server-proxy/ServerProxy";
import { InstanceReference, ObjectLiteral } from "aelastics-types";
import { IStoreObject, objectType, objectUUID } from "../common/CommonConstants";
import { AbstractStore } from "../common/abstract-store";

/**
 * Store - application state consisting of several instances (IStoreObject)
 */

/**
 *
 */

export class Store extends AbstractStore {
  public readonly schemas: Map<string, t.TypeSchema> = new Map();
  public eventLog = new EventLog();
  protected repo: Repository<any> = new Repository(this.eventLog);
  protected server?: ServerProxy;
  protected readonly instances: Map<string, IStoreObject<ObjectLiteral>> =
    new Map();

  constructor(server?: ServerProxy) {
    super()
    this.server = server;
  }

  /**
   *  clear all instances and event log
   */
  public clear(clearSchema:boolean = false) {
    this.instances.clear();
    this.eventLog = new EventLog();
    this.repo = new Repository();
    if(clearSchema) 
      this.schemas.clear
  }

  public getObjectByID<T extends IStoreObject<ObjectLiteral>>(id: string): T | undefined {
    return this.instances.get(id) as T | undefined;
  }

  public async fetchObjectByID(
    type: t.Any,
    id: string
  )  {
    // read from server
    // deseralize
    // add to this.instances
    return this.getObjectByID(id);
  }

  public async persist() {}

  public create<P extends ObjectLiteral>(
    type: t. ObjectType<any,any>,
    initValue?: Partial<P>
  ): IStoreObject<P> {
    const obj = this.repo.create<P>(type, initValue);
    return obj;
  }

  public deepCreate<T extends t.ObjectLiteral>(
    type: t. ObjectType<any,any>,
    initValue: Partial<T>
  ): IStoreObject<T> {
    this.registerTypeSchema(type.ownerSchema);
    const obj = this.repo.deepCreate<T>(type, initValue);
    this.add(obj);
    return obj;
  }

  public add<T extends IStoreObject<ObjectLiteral>>(obj: T) {
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

  public delete<T extends IStoreObject<ObjectLiteral>>(object: T): void {
    let type = this.getType(object);
    if (type.typeCategory !== "Object")
      throw new Error(`You cannot delete typeCategory ${type.typeCategory}`);
    const obj = this.repo.delete(type as t.ObjectType<any, any>, object as any);
  }


}

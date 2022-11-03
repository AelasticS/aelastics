/*
 * Copyright (c) 2020 AelasticS
 * Author: Sinisa Neskovic
 */

import * as t from 'aelastics-types';
import { Repository } from './Repository';
import { observable, action, intercept, observe, IArraySplice, IObservableObject, values } from 'mobx';
import { EventLog } from '../eventLog/EventLog';
import { ServerProxy } from '../server-proxy/ServerProxy';
import { getUnderlyingType } from './HandleProps';
import { isSuccess } from 'aelastics-result';
import {objectType} from './CommonConstants';
import { Schema } from 'inspector';
import { Command, ObjectCommand } from '../server-proxy/CommandMaker';
import { TypeSchema } from 'aelastics-types';


/**
 * Object Store - keeps objects
 */

export class ObjectStore<R extends any> {
  public  eventLog = new EventLog();
  private repos: Map<t.Any, Repository<any>> = new Map();
  private server?: ServerProxy;
  private schemas: Map<string, TypeSchema> = new Map(); //TypeSchema[] = [];

  //  @observable
  public root: R | undefined; // = undefined as any
  // @ts-ignore
  constructor(R, server?: ServerProxy) {
    this.server = server;
  }

  private getRepos(type: t.Any): Repository<t.Any> {
    let rep = this.repos.get(type);
    if (!rep) {
      rep = new Repository(this.eventLog);
      this.repos.set(type, rep);
    }
    return rep;
  }

  public new<P>(type: t.Any, initValue: P): P {
    this.schemas.set(type.ownerSchema.path, type.ownerSchema)
    const rep = this.getRepos(type);
    const obj = rep.create2<P>(type, initValue);
    return obj;
  }
  
  public delete<P>(object: P): void {
    let type = this.resolveTypeFromObject(object as {});
    const rep = this.getRepos(type);
    if (type.typeCategory !== 'Object') throw new Error(`You cannot delete typeCategory ${type.typeCategory}`);
    const obj = rep.delete(type as t.ObjectType<any,any>, object as {});
  }

  private resolveTypeFromObject(obj: {}):t.Any {
    const path = obj[objectType];
  
    for (const schema of this.schemas.values()) {
      const type = schema.getType(path);
      if(type)
       return type
    }
    throw new Error(`Object type '${path}' does not exist in schemas`);

  }

  // public load2(initValue: R){
  //   const rep = this.getRepos(this.rootType);
  //   const obj = rep.load2<R>(this.rootType, initValue);
  //   this.setRoot(obj)
  //   return obj;
  // }

  
  /**
   * Strategies:
   *  1. subtypes collapsed into supertype/expanded into separte 
   *  2. all relationships collapsed into one super rel/expanded into separte rels
   *  3. all attaributes are collapsed
   * 
   */

  /*
  public save() {
    if (!this.server) throw new Error('Store without server.');
    const cmdMaker = this.server.getCommandMaker(this.rootType.ownerSchema);
    const cmds = cmdMaker.makeCommands(this.eventLog)
    const req = this.server.getServerRequest<Command, any>(cmds)
    const res = this.server.execute(req)
    // TODO: reset store and eventLog, or clear and populate with results
    this.eventLog.clear();
  }

  public load(rootID: string){

  }

  public loadProperty(object: object, property: string) {
    // make query command to get object/s 
    // izvuci iz objekta njegov tip: t1, uzeti tip propertija: t2 a onda naci inverzni property: i1 od datog propertija i konstruisati query koji izvlaci t2 a uslov je da je i1 = objectID 
    // query izvrsava repository za t2 i on formira objekte preko HandleProps
    // setovati po ulaznom objektu properti sa dobijenim objektom/ima (bez event log-a!)
  }

  */
}

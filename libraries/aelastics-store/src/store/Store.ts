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
import {IStoreObject, objectType} from './CommonConstants';
import { Schema } from 'inspector';
import { Command, ObjectCommand } from '../server-proxy/CommandMaker';
import { ObjectLiteral } from 'aelastics-types';

/**
 * // TODO identifier generation
 * // TODO inverse properties
 * // TODO state of objects, via
 * // TODO creating ServerCommand
 * // TODO creating ServerQuery
 * // TODO transactions
 * // TODO cash for created instances
 * // TODO find an object by ID
 * // TODO find objects by ID
 *
 **/

/**
 * Store - keeps application state
 */

export class Store<R extends ObjectLiteral> {
  public readonly rootType: t.Any;
  public  eventLog = new EventLog();
 // private repos: Map<t.Any, Repository<any>> = new Map();
  private repo:Repository<t.Any> = new Repository(this.eventLog)
  private server?: ServerProxy;
  //  @observable
  public root: R | undefined; // = undefined as any

  constructor(rootType: t.Any, root?: R, server?: ServerProxy) {
    this.rootType = rootType;
    this.root = root;
    this.server = server;
  }



  //  @action
  public setRoot(root: R | undefined) {
    this['root'] = root;
  }

  //  @action
  public newRoot(initValue?: Partial<R>) {
    this['root'] = this.new(this.rootType, initValue);
  }

  // public new(type: t.Any, initValue?: Partial<t.TypeOf<typeof type>>): t.TypeOf<typeof type> {
  public new<P extends ObjectLiteral>(type: t.Any, initValue?: Partial<P>): P {
    const obj = this.repo.deepCreate(type, initValue);
    return obj;
  }

  public deepCreate<P extends ObjectLiteral>(type: t.Any, initValue: P): IStoreObject<P> {
    const obj = this.repo.deepCreate<P>(type, initValue);
    return obj;
  }

  public create<P extends ObjectLiteral>(type: t.Any, initValue: P): IStoreObject<P> {
    const obj = this.repo.create<P>(type, initValue);
    return obj;
  }
  
  public delete<P>(object: P): void {
    let type = this.resolveTypeFromObject(object as Object);
    if (type.typeCategory !== 'Object') throw new Error(`You cannot delete typeCategory ${type.typeCategory}`);
    const obj = this.repo.delete(type as t.ObjectType<any,any>, object as any);
  }



  private resolveTypeFromObject(obj: {}):t.Any {

    const schema = this.rootType.ownerSchema 
  
    // @ts-ignore
    const path = obj[objectType];
    const type = schema.getType(path);

    if (!type) throw new Error(`Object type '${path}' does not exist in schema '${schema.name}'`);

    return type;
  }

  public importDTO(initValue: ObjectLiteral){
    const tmpRepo = new Repository()
    // avoid eventLog 
    // const obj = this.repo.importFromDTO<R>(this.rootType, initValue);
    const obj = tmpRepo.importFromDTO<R>(this.rootType, initValue);
    this.setRoot(obj)
    return obj;
  }

  
  /**
   * Strategies:
   *  1. subtypes collapsed into supertype/expanded into separte 
   *  2. all relationships collapsed into one super rel/expanded into separte rels
   *  3. all attaributes are collapsed
   * 
   */
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

}

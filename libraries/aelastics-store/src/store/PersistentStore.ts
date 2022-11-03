/*
 * Copyright (c) 2020 AelasticS
 * Author: Sinisa Neskovic
 */

 import { Repository } from './Repository';
import { ServiceResult, success } from 'aelastics-result';
import { Store } from './Store';
import * as t from 'aelastics-types';
import {action} from "mobx";

export class PersistentStore<R extends any, ID extends any> extends Store<R> {
  constructor(rootType: t.Any, root?: R) {
    super(rootType, root);
  }

  // @action
  // async load(rootID: ID): Promise<R> {
  //   let proj = Repository.create(this.rootType);
  //   this.setRoot(proj);
  //   return proj;
  // }

  /*
  @action
  async save(): Promise<boolean> {
    return true;
  }
  */
 
  @action
  async deleteProject(projectID: number): Promise<boolean> {
    this.setRoot(undefined)
    return true
  }
}

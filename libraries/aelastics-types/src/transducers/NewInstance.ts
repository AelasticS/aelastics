/*
 * Copyright (c) AelasticS 2020.
 */

import { Node } from '../common/Node';
import { ServiceError } from 'aelastics-result';
import { ITransformer, WhatToDo } from './Transformer';
import { System } from '../type/TypeSchema';


const RECURSE_LEVEL = 50;

export class NewInstance implements ITransformer {
  private xf: ITransformer;
  public readonly templateObj: any;
  private _currentTemplate: any[] = [];
  private _generateID?: () => any;
  
  constructor(xf: ITransformer, templateObj?: any, generateID?: () => any) {
    this.xf = xf;
    this.templateObj = templateObj;
    this._generateID = generateID;
  }

  init(value: any, currNode: Node): [any, WhatToDo] {

    if (this._currentTemplate.length > RECURSE_LEVEL) {
      throw new ServiceError(
        'RangeError',
        `Stack too deep.Possible infinitive recursive definition via ${currNode.type.name}.${currNode.extra.propName} .`
      );
    }
    this._currentTemplate.push(currNode);
    switch (currNode.extra.role) {
      case 'asRoot':
        if(this.templateObj) // make new instance based on template
          currNode.instance = this.templateObj;
    }
    let [r, a] = this.xf.init(value, currNode);
 
    return [r, a];
  }

  result(result: any, currNode: Node): [any, WhatToDo] {
    let typeName: string;
    if (
      currNode.type.typeCategory === 'Object' &&
      //  r['@@aelastics/type'] === undefined &&
      currNode.instance !== undefined &&
      (typeName = currNode.instance['@@aelastics/type']) 
      // TODO:Define constant strings in aelasticType
    ) {
      let type = System.getType(typeName);
      if (type) currNode.type = type;
    }
    
    Object.defineProperty(result, '@@aelastics/type', {
      value: currNode.type.fullPathName,
      writable: true,
      enumerable: false,
      configurable: true
    });
    
    if (this._generateID)
      Object.defineProperty(result, '@@aelastics/ID', {
        value: this._generateID(),
        writable: true,
        enumerable: true,
        configurable: true
      });
    this._currentTemplate.pop();
    return this.xf.result(result, currNode);
  }

  step(result: any, currNode: Node, value: any): [any, WhatToDo] {
    if (value === undefined) value = currNode.type.init(currNode);
    return this.xf.step(result, currNode, value);
  }
}

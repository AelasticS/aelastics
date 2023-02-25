import { ObjectType, TypeSchema, undefinedType } from 'aelastics-types';
import * as EventLog from '../eventLog/EventLog';
import { objectType as OBJECT_TYPE_PROPERTY, objectUUID } from '../store/CommonConstants';
import {findTypeCategory} from 'aelastics-types'

/*
 * Copyright (c) 2020 AelasticS
 *
 * Author: Sinisa Neskovic
 *
 */

export enum Operation {
  create,
  update,
  delete,
  connect,
  disconnect
}

export type ObjectCommand = Create | Delete | Update | Connect | Disconnect;
type MergeResult = 'merged' | 'not_merged' | 'cancel';

export abstract class Command {
  // @ts-ignore
  readonly operationType: Operation;
  // @ts-ignore
  firstObjID: ObjectProps;
  readonly firstObjType: string;
  readonly versioning : boolean;

  constructor(objType: string, versioning: boolean = false) {
    this.firstObjType = objType
    this.versioning = versioning;
  }

  get secondObjID(): ObjectProps | undefined {
    return undefined;
  }

  abstract mergeWith(c: EventLog.OperationEvent): MergeResult;
}

interface ObjectProps {
  propNames: string[],
  propValues: string[]
}
export class Create extends Command {
  readonly operationType: Operation = Operation.create;
  readonly type: string;
  props: ObjectProps;
  

  constructor(oc: EventLog.ObjectCreated, readonly schema: TypeSchema, versioning: boolean = false) {
    // @ts-ignore
    super(oc.object[OBJECT_TYPE_PROPERTY], versioning);
    this.firstObjID = {propNames: [], propValues: []};
    this.props = {
      propNames: [],
      propValues: []
    }
    this.type = oc.className;
    const t = schema.getType(oc.className);
    switch (t?.typeCategory) {
      case 'Object':
        const ot = t as ObjectType<any, any>;
        if(ot.identifier)
        ot.identifier.forEach((key: string)=> {
          //add to firstObjID
          this.firstObjID.propNames.push(key)
          // @ts-ignore
          this.firstObjID.propValues.push(oc.object[key])
        })
        let i = 0
        ot.allProperties.forEach((v, k) => {
          if(!this.firstObjID.propNames.includes(k)){
          this.props.propNames[i] = k
          let category = findTypeCategory(v);
          if (category !== 'Object') 
          // @ts-ignore
            this.props.propValues[i] = oc.object[k];
          else{
            // @ts-ignore
            if(!oc.object[k])
              this.props.propValues[i] = "null";
            else
            // @ts-ignore
              this.props.propValues[i] = oc.object[k][objectUUID];
          }  
         i++;
        }
        });
        break; 
    }
  }

  mergeWith(c: EventLog.Event): MergeResult {
    // @ts-ignore
    if (this.firstObjID !== c.object[objectUUID]) return 'not_merged';
    switch (c.type) {
      case EventLog.EventType.ObjectCreated:
      case EventLog.EventType.ObjectDeleted:
        return 'cancel';
      case EventLog.EventType.PropertyChanged: {
        const pc = c as EventLog.PropertyChanged;
        let newValue = pc.newValue;
        let i = this.props.propNames.indexOf(pc.property)
        // @ts-ignore
        const t = this.schema.getType(pc.object[OBJECT_TYPE_PROPERTY]) as ObjectType<any, any>;
        if(t === undefined)
          throw new Error();
        let property = t.allProperties.get(pc.property)
        if(property === undefined)
          throw new Error();
        let category = findTypeCategory(property);
        if(category === 'Object' && newValue)
          newValue = newValue[objectUUID];
        if (i >= 0)
          this.props.propValues[i] = newValue;
        else {
          this.props.propNames.push(pc.property)
          this.props.propValues.push(newValue)
        }
        return 'merged';
      }
      case EventLog.EventType.ElementInserted:
      case EventLog.EventType.ElementRemoved:
        return 'not_merged';
    }
    return 'not_merged';
  }
}

export class Delete extends Command {
  readonly operationType: Operation = Operation.delete;
  constructor(oc: EventLog.ObjectDeleted, versioning: boolean = false) {
    // @ts-ignore
    super(oc.object[OBJECT_TYPE_PROPERTY], versioning);
    this.firstObjID = this.firstObjID = {propNames: [], propValues: []};
  }
  mergeWith(c: EventLog.OperationEvent): MergeResult {
    // @ts-ignore
    if (this.firstObjID !== c.object[objectUUID]) return 'not_merged';
    else
    // @ts-ignore
      throw new Error(`Operation on deleted object (type: "${c.object[OBJECT_TYPE_PROPERTY]}", ID:${this.firstObjID})`);
  }
}
export class Update extends Command {

  readonly operationType: Operation = Operation.update;
  props: ObjectProps;
  type: string = '';


  constructor(oc: EventLog.PropertyChanged, versioning: boolean = false) {
    // @ts-ignore
    super(oc.object[OBJECT_TYPE_PROPERTY], versioning);
    this.firstObjID = this.firstObjID = {propNames: [], propValues: []};
    this.props = {
      propNames: [],
      propValues: []
    }
    this.props.propNames.push(oc.property);
    this.props.propValues.push(oc.newValue);
  }
  mergeWith(c: EventLog.OperationEvent): MergeResult {
    // @ts-ignore
    if (this.firstObjID !== c.object[objectUUID]) return 'not_merged';
    switch (c.type) {
      case EventLog.EventType.PropertyChanged:
        {
          const pc = c as EventLog.PropertyChanged;
          let i = this.props.propNames.indexOf(pc.property)
          if (i >= 0)
            this.props.propValues[i] = pc.newValue;
          else {
            this.props.propNames.push(pc.property)
            this.props.propValues.push(pc.newValue)
          }
          return 'merged';
        }
      case EventLog.EventType.ObjectCreated:
      case EventLog.EventType.ObjectDeleted:
      case EventLog.EventType.ElementInserted:
      case EventLog.EventType.ElementRemoved:
        return 'not_merged';
    }
    return 'not_merged';
  }
}
export class Connect extends Command {
  readonly operationType: Operation = Operation.connect;
  assocName: string;
  // @ts-ignore
  private _secondObjID: ObjectProps;

  public get secondObjID(): ObjectProps {
    return this._secondObjID;
  }
  public set secondObjID(value: ObjectProps) {
    this._secondObjID = value;
  }

  constructor(oc: EventLog.CollectionElementInserted | EventLog.PropertyChanged, versioning: boolean = false) {
    // @ts-ignore
    super(oc.object[OBJECT_TYPE_PROPERTY], versioning);
    this.firstObjID = this.firstObjID = {propNames: [], propValues: []};
    if (oc instanceof EventLog.CollectionElementInserted) {
      // @ts-ignore
      this.secondObjID = oc.secondArgObject[objectUUID];
      this.assocName = oc.property;
    } else {
      this.secondObjID = oc.newValue[objectUUID];
      this.assocName = oc.property;
    }
  }

  mergeWith(c: EventLog.OperationEvent): MergeResult {
    if (this.firstObjID !== c.object[objectUUID]) return 'not_merged';
    switch (c.type) {
      case EventLog.EventType.PropertyChanged:
        const pc = c as EventLog.PropertyChanged;
        if (this.assocName !== pc.property) return 'not_merged';
        if (pc.newValue === undefined) return 'not_merged';
        this.secondObjID = pc.newValue[objectUUID];
        return 'merged';
      case EventLog.EventType.ElementRemoved:
        const cr = c as EventLog.CollectionElementRemoved;
        if (this.assocName !== cr.property) return 'not_merged';
  // @ts-ignore
        if (this.secondObjID === cr.secondArgObject[objectUUID]) return 'cancel';
      case EventLog.EventType.ObjectCreated:
      case EventLog.EventType.ObjectDeleted:
      case EventLog.EventType.ElementInserted:
        return 'not_merged';
    }
    return 'not_merged';
  }
}

export class Disconnect extends Command {
  readonly operationType: Operation = Operation.disconnect;
  assocName: string = '';
  private _secondObj: ObjectProps | undefined;

  public get secondObjID(): ObjectProps {
    return this._secondObj!;
  }
  public set secondObjID(value: ObjectProps) {
    this._secondObj = value;
  }

  constructor(oc: EventLog.CollectionElementRemoved | EventLog.PropertyChanged, versioning: boolean = false) {
    // @ts-ignore
    super(oc.object[OBJECT_TYPE_PROPERTY], versioning);
    this.firstObjID = this.firstObjID = {propNames: [], propValues: []};
  }

  mergeWith(c: EventLog.OperationEvent): MergeResult {
    // @ts-ignore
    if (this.firstObjID !== c.object[objectUUID]) return 'not_merged';
    switch (c.type) {
      case EventLog.EventType.PropertyChanged:
        const pc = c as EventLog.PropertyChanged;
        if (this.assocName !== pc.property) return 'not_merged';
        if (pc.newValue === undefined) return 'merged';
        return 'not_merged';
      case EventLog.EventType.ElementInserted:
        const cr = c as EventLog.CollectionElementRemoved;
        if (this.assocName !== cr.property) return 'not_merged';
        // @ts-ignore
        if (this.secondObjID === cr.secondArgObject[objectUUID]) return 'cancel';
      case EventLog.EventType.ObjectCreated:
      case EventLog.EventType.ObjectDeleted:
      case EventLog.EventType.ElementRemoved:
        return 'not_merged';
    }
    return 'not_merged';
  }
}

export class CommandMaker {
  schema: TypeSchema;
  constructor(schema: TypeSchema) {
    this.schema = schema;
  }

  public makeCommands(log: EventLog.EventLog): ObjectCommand[] {
    const commands = new Array<ObjectCommand>(0);
    log.getAllActions().forEach((action) => {
      action.events.forEach((event) => {
        let i = commands.length;
        //TODO:  actions array is empty
        let res = 'not_merged';
        if (commands[i])
          res = commands[i].mergeWith(event);
        while (i > 0 && res === 'not_merged') {
          res = commands[--i].mergeWith(event);
        }
        switch (res) {
          case 'merged':
            break;
          case 'not_merged':
            const command = this.fromLogItem(event);
            commands.push(command);
            break;
          case 'cancel':
            commands.splice(i, 1);
            this.cancelCommands(event);
            break;
        }
      });
    });
    return commands;
  }

  // public makeCommands(log: EventLog.EventLog): ObjectCommand[] {

  //   const commands = new Array<ObjectCommand>(0);

  //   log.getAllActions().forEach((action) => {

  //     action.events.forEach((event) => {

  //       let i = commands.length;
  //       let res = 'not_merged';

  //       if(commands[i])
  //         res = commands[i].mergeWith(event);
  //       while (i>0 && res === 'not_merged') {
  //         res = commands[--i].mergeWith(event);
  //       }

  //       switch (res) {

  //         case 'merged':

  //           break;

  //         case 'not_merged':

  //           const command = this.fromLogItem(event);

  //           commands.push(command);

  //           break;

  //         case 'cancel':

  //           commands.splice(i, 1);

  //           this.cancelCommands(event);

  //           break;

  //       }

  //     });

  //   });

  //   return commands;

  // }

  private cancelCommands(e: EventLog.Event) {}

  private fromLogItem(item: EventLog.LogItem): ObjectCommand {
    switch (item.type) {
      case EventLog.EventType.ObjectCreated:
        return new Create(item as EventLog.ObjectCreated, this.schema);
        break;
      case EventLog.EventType.ObjectDeleted:
        return new Delete(item as EventLog.ObjectDeleted);
        break;
      case EventLog.EventType.PropertyChanged:
        let i = item as EventLog.PropertyChanged;
        if (typeof i.newValue === 'object' || typeof i.oldValue === 'object') {
          if (i.newValue === undefined || i.newValue === null) return new Disconnect(i);
          else return new Connect(i);
        } else return new Update(item as EventLog.PropertyChanged);
      break;
      case EventLog.EventType.ElementInserted:
        return new Connect(item as EventLog.CollectionElementInserted);
        break;
      case EventLog.EventType.ElementRemoved:
      default:
        return new Connect(item as EventLog.CollectionElementInserted);
        break;
    }
  }
}

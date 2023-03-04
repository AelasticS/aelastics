/* tslint:disable:max-classes-per-file*/
/* tslint:disable:interface-name */
/* tslint:disable:array-type */
/* tslint:disable:ban-types */

import { ObjectLiteral, ObjectType } from "aelastics-types";

//  Transaction is changed to Action!

// import * as Store from "./AppStore"

const undoDepth: number = 10; // how many undo/redo to allow

export enum EventType {
  ActionCreated,
  ReadObject, // object was read or accessed, this event is needed due to object cache creation
  ObjectCreated,
  ObjectDeleted,
  PropertyChanged,
  ElementInserted,
  ElementRemoved
}

export class EventLog {
  public _state: 'normal' | 'undo' | 'redo' = 'normal';

  protected actions: Action[] = new Array<Action>(undoDepth);

  protected lastActive: number = -1;
  protected lastCreated: number = -1;

  // TODO: add and remove listeneres
  public readonly listeners = new Map<any, any>();

  public get state() {
    return this._state;
  }

  public clear(){
    this.actions = new Array<Action>(undoDepth);
    this.lastActive = -1;
    this.lastCreated = -1;
  }

  // whole log
  public getAllActions(): Action[] {
    return this.actions;
  }

  public clearEvents() {
    this.actions.forEach((action)=> {
      action.events = new Array<Event>(0);
    })
  }


  public getAction(id: number): Action | undefined {
    return this.actions.find((t, i) => t.id === id);
  }

  public get lastAction(): Action {
    if (this.emptyLog) {
      this.createAction('default-action');
    }
    return this.actions[this.lastActive];
  }

  public get emptyLog(): boolean {
    return this.lastActive === -1;
  }

  public get fullLog(): boolean {
    return this.lastActive === undoDepth - 1;
  }

  // Action corresponds to user action or redux operation
  public createAction(name: string): Action {
    //        if (this.fullLog)
    //            throw new Error('Full event log');

    this.clearAfterLastActive();
    this.lastActive = ++this.lastCreated;
    this.actions[this.lastActive] = new Action(this.lastActive, name); // action id is its index + 1

    return this.lastAction;
  }

  public undo() {
    if (!this.emptyLog) {
      this._state = 'undo';
      this.actions[this.lastActive].undo();
      this.lastActive--;
      this._state = 'normal';
    }
  }

  public redo() {
    if (this.lastActive < this.lastCreated) {
      this._state = 'redo';
      this.actions[this.lastActive].redo();
      this.lastActive++;
      this._state = 'normal';
    }
  }

  protected clearAfterLastActive() {
    for (let i = this.lastActive + 1; i <= this.lastCreated; i++) {
      this.actions.splice(i, 1);
    }
    this.lastCreated = this.lastActive; // reset index to last active
  }
}

export abstract class LogItem {
  public readonly type: EventType;
  public readonly time: Date = new Date(Date.now());

  public abstract undo(): void;
  public abstract redo(): void;

  constructor(eventType: EventType) {
    this.type = eventType;
  }
}

export type Event =
  // | Action
  ObjectCreated | ObjectDeleted | PropertyChanged | CollectionElementInserted | CollectionElementRemoved;

export class Action extends LogItem {
  public id: number;
  public /* protected */ name: string;
  public /*private */ events: Event[] = new Array<Event>(0);

  constructor(id: number, name: string) {
    super(EventType.ActionCreated);
    this.id = id + 1;
    this.name = name;
  }

  public objectCreated(obj: Object, objType: ObjectType<any,any>): Action {
    return this.newOperationEvent(new ObjectCreated(obj, objType));
  }

  public objectDeleted(obj: Object): Action {
    return this.newOperationEvent(new ObjectDeleted(obj));
  }

  public propertyValueSet(obj: Object, propertyName: string, newValue: any, oldValue: any): Action {
    return this.newOperationEvent(new PropertyChanged(obj, propertyName, newValue, oldValue));
  }

  public objectInserted(firstObj: Object, secondObj: Object, propertyName: string): Action {
    return this.newOperationEvent(new CollectionElementInserted(firstObj, secondObj, propertyName));
  }

  public objectRemoved(firstObj: Object, secondObj: Object, propertyName: string): Action {
    return this.newOperationEvent(new CollectionElementRemoved(firstObj, secondObj, propertyName));
  }

  public undo() {
    for (let index = this.events.length - 1; index >= 0; index--) {
      this.events[index].undo();
    }
  }

  public redo() {
    for (const i of this.events) i.redo();
  }

  private newOperationEvent(event: Event): Action {
    this.events.push(event);
    return this;
  }
}

export abstract class OperationEvent extends LogItem {
  public object: ObjectLiteral;

  constructor(obj: Object, type: EventType) {
    super(type);
    this.object = obj;
  }
}

export class ObjectCreated extends OperationEvent {
  public objectConstructor: Function;
  public objectType: ObjectType<any,any>;

  constructor(obj: Object, objectType: ObjectType<any,any>) {
    super(obj, EventType.ObjectCreated);
    this.objectConstructor = obj.constructor;
    this.objectType = objectType;
  }

  public undo() {
    return;
  } // to do

  public redo() {
    return;
  } //
}

export class ObjectDeleted extends OperationEvent {
  constructor(obj: Object) {
    super(obj, EventType.ObjectDeleted);
  }

  public undo() {
    return;
  } // to do
  public redo() {
    return;
  } // to do
}

export class PropertyChanged extends OperationEvent {
  public readonly property: string; // Ime polja koje se promenilo
  public readonly oldValue: any; // stara vrednost
  public readonly newValue: any; // nova vrednost
  //    private parseFunction: (s: string) => any; // Function;  // funkcija koja treba vrednost da vrati u format koji treba da bude (npr. String => Date)

  constructor(obj: Object, propertyName: string, newValue: any, oldValue: any) {
    super(obj, EventType.PropertyChanged);
    this.property = propertyName;
    this.oldValue = oldValue;
    this.newValue = newValue;
    //        this.parseFunction = parseFunction;
  }

  public undo() {
    /*        if (this.parseFunction != null) {
            this.firstArgObject[this.property] = this.parseFunction(this.oldValue);
        }*/

    this.object[this.property] = this.oldValue;
  }

  public redo() {
    /*        if (this.parseFunction != null) {
            this.firstArgObject[this.property] = this.parseFunction(this.newValue);
        }*/

    this.object[this.property] = this.newValue;
  }
}

export class CollectionElementInserted extends OperationEvent {
  public property: string; // the name of collection property
  public secondArgObject: Object;

  constructor(firstObj: Object, secondObj: Object, propertyName: string) {
    super(firstObj, EventType.ElementInserted);
    this.secondArgObject = secondObj;
    this.property = propertyName;
  }

  // resiti problem kolekcije
  public undo() {
    return;
  } // to do
  public redo() {
    return;
  } // to do
}

export class CollectionElementRemoved extends OperationEvent {
  public property: string; // the name of collection property
  public secondArgObject: Object;

  constructor(firstObj: Object, secondObj: Object, propertyName: string) {
    super(firstObj, EventType.ElementRemoved);
    this.secondArgObject = secondObj;
    this.property = propertyName;
  }

  public undo() {
    return;
  } // to do
  public redo() {
    return;
  } // to do
}

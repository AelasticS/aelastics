/*
 * Author: Sinisa Neskovic
 *
 * Copyright (c) 2020 Aelatics
 */

import { EventLog } from "./EventLog";
import { prefixValue } from "../store/CommonConstants";

import {
  IArrayChange,
  IArraySplice,
  IMapDidChange,
  IObjectDidChange,
} from "mobx";
import { Any } from "aelastics-types";
import { objectSync } from "../store/CommonConstants";

export const getObjectListener = (
  eventLog: EventLog,
  propertyNames: string[]
) => {
  return (change: IObjectDidChange<Object>) => {
    switch (change.type) {
      case "update":
  // @ts-ignore
        if (change.object[objectSync]) return;
        if (!propertyNames.includes(change.name.toString())) return; // do not log if not public
        if (change.newValue === change.oldValue) return; // do not log if no effect
        eventLog.lastAction.propertyValueSet(
          change.object,
          change.name.toString().substring(prefixValue.length),
          change.newValue,
          change.oldValue
        );
    }
  };
};

export const getArrayListener = (
  eventLog: EventLog,
  object: Object,
  propertyName: string
) => {
  return (change: IArrayChange<any> | IArraySplice<any>) => {
    switch (change.type) {
      case "update":
        // @ts-ignore
        if (object[objectSync]) return;
        eventLog.lastAction.objectRemoved(
          object,
          change.oldValue,
          propertyName
        );
        eventLog.lastAction.objectInserted(
          object,
          change.newValue,
          propertyName
        );
        break;
      case "splice":
        // @ts-ignore
        if (object[objectSync]) return;
        change.added.map((newElem) => {
          eventLog.lastAction.objectInserted(object, newElem, propertyName);
        });
        change.removed.map((oldlElem) => {
          eventLog.lastAction.objectRemoved(object, oldlElem, propertyName);
        });
        break;
    }
  };
};

export const getMapListener = (
  eventLog: EventLog,
  object: Object,
  propertyName: string
) => {
  return (change: IMapDidChange) => {
    switch (change.type) {
      case "add":
        eventLog.lastAction.objectInserted(
          object,
          change.newValue,
          propertyName
        );
        break;
      case "delete":
        eventLog.lastAction.objectRemoved(
          object,
          change.oldValue,
          propertyName
        );
        break;
      case "update":
        eventLog.lastAction.objectInserted(
          object,
          change.newValue,
          propertyName
        );
        eventLog.lastAction.objectRemoved(
          object,
          change.oldValue,
          propertyName
        );
        break;
    }
  };
};

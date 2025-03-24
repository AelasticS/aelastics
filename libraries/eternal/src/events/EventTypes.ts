import { ChangeLogEntry } from './ChangeLog';

export type EventPayload = {
  eventType: string;
  timestamp: Date;
  objectId?: string;
  changes?: ChangeLogEntry[];
};

export type Result = 
  | { success: true }
  | { success: false; errors: ErrorInfo[] };

export type ErrorInfo = {
  message: string;
  code?: number;
  labels?: string[];
};
import { ChangeLogEntry } from './ChangeLog';
import { Timing, Operation, Type, Property } from './SubscriptionInterface';

export type EventPayload = {
  timing: 'before' | 'after' | 'beforeCommit' | 'afterCommit'; // Specific timing of the event
  operation: 'create' | 'update' | 'delete'; // Specific operation type
  objectType: string; // The TypeMeta qName of the object being modified (e.g., "Person")
  property?: string; // The specific property being modified (optional, e.g., "name")
  timestamp: number; // The time when the event occurred in milliseconds since epoch
  objectId?: string; // The ID of the object being modified
  changes?: ChangeLogEntry[]; // Describes the specific changes
}

export type Result = 
  | { success: true } // Indicates the operation was successful
  | { success: false; errors: ErrorInfo[] }; // Indicates the operation failed with errors

export type ErrorInfo = {
  message: string; // Error message
  code?: number; // Optional error code
  labels?: string[]; // Optional labels for categorizing the error
};

export interface CancelTransactionError extends ErrorInfo {
  reason: string; // A detailed reason for why the transaction was canceled
  eventPayload: EventPayload; // The event payload that caused the cancellation
}
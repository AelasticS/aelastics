export type UUID = string;

export interface ChangeLog {
    type: 'insert' | 'update' | 'delete';
    objectId: UUID;
    property?: string;
    oldValue?: any;
    newValue?: any;
}

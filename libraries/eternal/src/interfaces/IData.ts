export interface IData {
  // JSON serialization for individual objects
  serialize<T>(obj: T): string;
  deserialize<T>(json: string, type: string, validate?: boolean): T;
  
  // Batch operations (future extensions)
  serializeBatch?<T>(objects: T[]): string;
  deserializeBatch?<T>(json: string): T[];
}
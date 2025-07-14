export interface Result {
  success: boolean;
  errors?: string[];
}

export interface IObjects {
  // Object lifecycle
  create<T>(type: string, initialState?: Partial<T>): T;
  update<T>(recipe: (obj: T) => void, obj?: T): T;
  delete<T>(obj: T): void;
  
  // Object retrieval
  find<T extends object>(type: string, predicate?: (obj: T) => boolean, state?: number): T[];
  findByUUID<T extends object>(uuid: string, state?: number): T | undefined;
  getUUID<T extends object>(obj: T): string;
  
  // Object conversion (plain objects ↔ store objects)
  import<T>(plainObject: any, type?: string): T;
  export<T>(storeObject: T): any;
  
  // Validation
  validate?<T>(obj: T): Result;
}
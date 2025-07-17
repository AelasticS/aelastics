import { TypeMeta } from "../registry/TypeDefinitions";

export interface Result {
  success: boolean;
  errors?: string[];
}

export interface IObjects {
  // Object lifecycle - Enhanced API with unambiguous type resolution
  create<T>(qualifiedName: string, initialState?: Partial<T>): T;
  create<T>(typeMeta: TypeMeta, initialState?: Partial<T>): T;
  update<T>(recipe: (obj: T) => void, obj?: T): T;
  delete<T>(obj: T): void;
  
  // Object retrieval - Enhanced API
  find<T extends object>(qualifiedName: string, predicate?: (obj: T) => boolean, state?: number): T[];
  find<T extends object>(typeMeta: TypeMeta, predicate?: (obj: T) => boolean, state?: number): T[];
  findByUUID<T extends object>(uuid: string, state?: number): T | undefined;
  getUUID<T extends object>(obj: T): string;
  
  // Object conversion (plain objects ↔ store objects) - Enhanced API  
  import<T>(plainObject: any, qualifiedName: string): T;
  import<T>(plainObject: any, typeMeta: TypeMeta): T;
  export<T>(storeObject: T): any;
  
  // Validation
  validate?<T>(obj: T): Result;
}
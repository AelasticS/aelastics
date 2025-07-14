export interface IState {
  // Define the state structure - this will need to be filled based on existing implementation
  index: number;
  timestamp: number; // Unix timestamp in milliseconds for efficient comparison and serialization
}

export interface ChangeLogEntry {
  // Define the change log entry structure - based on existing implementation
  type: string;
  timestamp: Date;
  objectId: string;
  property?: string;
  oldValue?: any;
  newValue?: any;
}

export interface IHistory {
  // Time travel operations
  undo(): boolean;
  redo(): boolean;
  
  // State access
  getState(): IState;
  getStateByIndex(index: number): IState;
  fromState<T>(stateIndex: number, target: string | T): T | undefined;
  
  // Transaction management
  produce<T>(recipe: (obj: T) => void): IState;
  
  // Transaction state
  isInUpdateMode(): boolean;
  
  // Change tracking
  getAllChanges(option?: "all" | "only_modifications"): ChangeLogEntry[];
  consolidate(): void;
  
  // State introspection
  getCurrentStateIndex(): number;
  getStateCount(): number;
}
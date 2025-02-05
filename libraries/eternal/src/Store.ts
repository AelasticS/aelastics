import { State } from './State';
import { generateUUID } from './utils';

export class Store {
    private stateHistory: State[] = [];

    constructor() {
        this.stateHistory.push(new State(this));
    }

    private makeNewState(): void {
        this.stateHistory.push(new State(this, this.getState()));
    }

    /** Returns the latest state */
    public getState(): State {
        return this.stateHistory[this.stateHistory.length - 1];
    }

    /** Returns a specific state version (fixed-state objects) */
    public getStateByIndex(index: number): State | undefined {
        return this.stateHistory[index];
    }

    /** Retrieves a dynamically-tracked object (NOT fixed to a state) */
    public getObject<T>(uuid: string): T | undefined {
        return this.getState().getDynamicObject(uuid);
    }

    /** Returns an object fixed to a specific state */
    public fromState<T>(stateIndex: number, target: string | T): T | undefined {
        const state = this.getStateByIndex(stateIndex);
        if (!state) return undefined;

        // If target is a UUID, fetch the object from the state
        if (typeof target === "string") {
            return state.getObject(target);
        }

        // If target is an object, retrieve its UUID and fetch it from the state
        if (target && typeof target === "object" && "uuid" in target) {
            return state.getObject((target as { uuid: string }).uuid);
        }

        return undefined;
    }
    public produce<T>(recipe: (obj: T) => void, obj:T): T {
        this.makeNewState();
        recipe(obj);
        return obj;
    }
}


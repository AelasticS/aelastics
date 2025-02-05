import { State } from './State';

export class Store {
    private stateHistory: State[] = [];

    constructor() {
        this.stateHistory.push(new State(this));
    }

    public getState(): State {
        return this.stateHistory[this.stateHistory.length - 1];
    }
    private makeNewState(): void {
        this.stateHistory.push(new State(this, this.getState()));
    }

    public produce<T>(recipe: (obj: T) => void, obj:T): T {
        this.makeNewState
        recipe(obj);
        return obj;
    }
}

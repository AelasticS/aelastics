import { Store } from './Store';
import { ChangeLog } from './types';

export class State {
    private store: WeakRef<Store>;
    private previousState?: State;
    private changes: ChangeLog[] = [];

    constructor(store: Store, previousState?: State) {
        this.store = new WeakRef(store);
        this.previousState = previousState;
    }

    public recordChange(change: ChangeLog): void {
        this.changes.push(change);
    }

    public getChangeLog(): ChangeLog[] {
        return this.changes;
    }

    public getPreviousState(): State | undefined {
        return this.previousState;
    }

    public getStore(): Store | undefined {
        return this.store.deref(); // Retrieve the store instance if it's still available
    }
}

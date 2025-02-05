import { State } from '../State';
import { Store } from '../Store';

describe('State', () => {
    test('should track changes', () => {
        const state = new State(new Store);
        state.recordChange({ type: 'insert', objectId: '123' });
        expect(state.getChangeLog().length).toBe(1);
    });
});

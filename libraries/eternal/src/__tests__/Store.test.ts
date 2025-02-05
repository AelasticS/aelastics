import { Store } from '../Store';

describe('Store', () => {
    test('should create an instance of Store', () => {
        const store = new Store();
        expect(store).toBeDefined();
    });
});

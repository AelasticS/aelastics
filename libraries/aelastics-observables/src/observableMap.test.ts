import { createObservableMap, MapHandlers } from './observableMap';

describe('createObservableMap', () => {
    it('should call the set handler', () => {
        const target = new Map<string, number>();
        const handlers: MapHandlers<string, number> = {
            set: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true);
        proxy.set('a', 100);

        expect(handlers.set).toHaveBeenCalledWith(target, 'a', 100);
        expect(target.get('a')).toBe(100);
    });

    it('should call the delete handler', () => {
        const target = new Map<string, number>([['a', 1]]);
        const handlers: MapHandlers<string, number> = {
            delete: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true);
        proxy.delete('a');

        expect(handlers.delete).toHaveBeenCalledWith(target, 'a');
        expect(target.has('a')).toBe(false);
    });

    it('should call the clear handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const handlers: MapHandlers<string, number> = {
            clear: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true);
        proxy.clear();

        expect(handlers.clear).toHaveBeenCalledWith(target);
        expect(target.size).toBe(0);
    });

    it('should call the get handler', () => {
        const target = new Map<string, number>([['a', 1]]);
        const handlers: MapHandlers<string, number> = {
            get: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true);
        const value = proxy.get('a');

        expect(handlers.get).toHaveBeenCalledWith(target, 'a');
        expect(value).toBe(1);
    });

    it('should call the has handler', () => {
        const target = new Map<string, number>([['a', 1]]);
        const handlers: MapHandlers<string, number> = {
            has: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true);
        const result = proxy.has('a');

        expect(handlers.has).toHaveBeenCalledWith(target, 'a');
        expect(result).toBe(true);
    });

    it('should call the forEach handler', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const handlers: MapHandlers<string, number> = {
            forEach: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true);
        proxy.forEach((value, key) => {});

        expect(handlers.forEach).toHaveBeenCalledWith(target, expect.any(Function));
    });

});

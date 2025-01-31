import { createObservableMap, MapHandlers } from './observableMap';

describe('createObservableMap', () => {
    it('should call the set handler with extra parameter', () => {
        const target = new Map<string, number>();
        const extra = { context: 'test' };
        const handlers: MapHandlers<string, number, typeof extra> = {
            set: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true, extra);
        proxy.set('a', 100);

        expect(handlers.set).toHaveBeenCalledWith(target, 'a', 100, extra);
        expect(target.get('a')).toBe(100);
    });

    it('should call the delete handler with extra parameter', () => {
        const target = new Map<string, number>([['a', 1]]);
        const extra = { context: 'test' };
        const handlers: MapHandlers<string, number, typeof extra> = {
            delete: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true, extra);
        proxy.delete('a');

        expect(handlers.delete).toHaveBeenCalledWith(target, 'a', extra);
        expect(target.has('a')).toBe(false);
    });

    it('should call the clear handler with extra parameter', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const extra = { context: 'test' };
        const handlers: MapHandlers<string, number, typeof extra> = {
            clear: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true, extra);
        proxy.clear();

        expect(handlers.clear).toHaveBeenCalledWith(target, extra);
        expect(target.size).toBe(0);
    });

    it('should call the get handler with extra parameter', () => {
        const target = new Map<string, number>([['a', 1]]);
        const extra = { context: 'test' };
        const handlers: MapHandlers<string, number, typeof extra> = {
            get: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true, extra);
        const value = proxy.get('a');

        expect(handlers.get).toHaveBeenCalledWith(target, 'a', extra);
        expect(value).toBe(1);
    });

    it('should call the has handler with extra parameter', () => {
        const target = new Map<string, number>([['a', 1]]);
        const extra = { context: 'test' };
        const handlers: MapHandlers<string, number, typeof extra> = {
            has: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true, extra);
        const result = proxy.has('a');

        expect(handlers.has).toHaveBeenCalledWith(target, 'a', extra);
        expect(result).toBe(true);
    });

    it('should call the forEach handler with extra parameter', () => {
        const target = new Map<string, number>([['a', 1], ['b', 2]]);
        const extra = { context: 'test' };
        const handlers: MapHandlers<string, number, typeof extra> = {
            forEach: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers, true, extra);
        proxy.forEach((value, key) => {});

        expect(handlers.forEach).toHaveBeenCalledWith(
            target,
            expect.any(Function),
            extra
        );
    });

    it('should call the defaultAction handler with extra parameter', () => {
        const target = new Map<string, number>([['a', 1]]);
        const extra = { context: 'test' };
        const handlers: MapHandlers<string, number, typeof extra> = {
            defaultAction: jest.fn().mockReturnValue(true),
        };
    
        const proxy = createObservableMap(target, handlers, true, extra);
        const size = proxy.size;
    
        expect(handlers.defaultAction).toHaveBeenCalledWith(target, 'size', [], extra);
        expect(size).toBe(1);
    });

    it('should handle absence of extra parameter gracefully', () => {
        const target = new Map<string, number>();
        const handlers: MapHandlers<string, number> = {
            set: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableMap(target, handlers);
        proxy.set('a', 100);

        expect(handlers.set).toHaveBeenCalledWith(target, 'a', 100, undefined);
        expect(target.get('a')).toBe(100);
    });
});

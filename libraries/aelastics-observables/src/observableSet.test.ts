import { createObservableSet, SetHandlers } from './observableSet';

describe('createObservableSet', () => {
    it('should call the add handler with extra parameter', () => {
        const target = new Set<number>();
        const extra = { context: 'test' };
        const handlers: SetHandlers<number, typeof extra> = {
            add: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableSet(target, handlers, true, extra);
        proxy.add(100);

        expect(handlers.add).toHaveBeenCalledWith(target, 100, extra);
        expect(target.has(100)).toBe(true);
    });

    it('should call the delete handler with extra parameter', () => {
        const target = new Set<number>([1, 2, 3]);
        const extra = { context: 'test' };
        const handlers: SetHandlers<number, typeof extra> = {
            delete: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableSet(target, handlers, true, extra);
        proxy.delete(2);

        expect(handlers.delete).toHaveBeenCalledWith(target, 2, extra);
        expect(target.has(2)).toBe(false);
    });

    it('should call the clear handler with extra parameter', () => {
        const target = new Set<number>([1, 2, 3]);
        const extra = { context: 'test' };
        const handlers: SetHandlers<number, typeof extra> = {
            clear: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableSet(target, handlers, true, extra);
        proxy.clear();

        expect(handlers.clear).toHaveBeenCalledWith(target, extra);
        expect(target.size).toBe(0);
    });

    it('should call the has handler with extra parameter', () => {
        const target = new Set<number>([1, 2, 3]);
        const extra = { context: 'test' };
        const handlers: SetHandlers<number, typeof extra> = {
            has: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableSet(target, handlers, true, extra);
        const result = proxy.has(1);

        expect(handlers.has).toHaveBeenCalledWith(target, 1, extra);
        expect(result).toBe(true);
    });

    it('should call the forEach handler with extra parameter', () => {
        const target = new Set<number>([1, 2, 3]);
        const extra = { context: 'test' };
        const handlers: SetHandlers<number, typeof extra> = {
            forEach: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableSet(target, handlers, true, extra);
        proxy.forEach((value) => {});

        expect(handlers.forEach).toHaveBeenCalledWith(
            target,
            expect.any(Function),
            extra
        );
    });

    it('should call the defaultAction handler with extra parameter', () => {
        const target = new Set<number>([1]);
        const extra = { context: 'test' };
        const handlers: SetHandlers<number, typeof extra> = {
            defaultAction: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableSet(target, handlers, true, extra);
        const size = proxy.size;

        expect(handlers.defaultAction).toHaveBeenCalledWith(target, 'size', [], extra);
        expect(size).toBe(1);
    });

    it('should handle absence of extra parameter gracefully', () => {
        const target = new Set<number>();
        const handlers: SetHandlers<number> = {
            add: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableSet(target, handlers);
        proxy.add(100);

        expect(handlers.add).toHaveBeenCalledWith(target, 100, undefined);
        expect(target.has(100)).toBe(true);
    });
});

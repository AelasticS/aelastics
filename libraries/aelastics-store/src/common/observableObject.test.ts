import { createObservableObject, ObjectHandlers } from './observableObject';

describe('createObservableObject', () => {
    it('should call the set handler with extra parameter', () => {
        const target: { a?: number } = { a: 1 };
        const extra = { context: 'test' };
        const handlers: ObjectHandlers<typeof target, typeof extra> = {
            set: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableObject(target, handlers, true, extra);
        proxy.a = 2;

        expect(handlers.set).toHaveBeenCalledWith(target, 'a', 2, extra);
        expect(target.a).toBe(2);
    });

    it('should call the delete handler with extra parameter', () => {
        const target: { a?: number } = { a: 1 };
        const extra = { context: 'test' };
        const handlers: ObjectHandlers<typeof target, typeof extra> = {
            delete: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableObject(target, handlers, true, extra);
        delete proxy.a;

        expect(handlers.delete).toHaveBeenCalledWith(target, 'a', extra);
        expect('a' in target).toBe(false);
    });

    it('should call the method handler with extra parameter', () => {
        const target = {
            greet(name: string) {
                return `Hello, ${name}`;
            },
        };
        const extra = { context: 'test' };
        const handlers: ObjectHandlers<typeof target, typeof extra> = {
            method: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableObject(target, handlers, true, extra);
        const result = proxy.greet('World');

        expect(handlers.method).toHaveBeenCalledWith(target, 'greet', ['World'], extra);
        expect(result).toBe('Hello, World');
    });

    it('should call the defaultAction handler with extra parameter', () => {
        const target = { a: 1 };
        const extra = { context: 'test' };
        const handlers: ObjectHandlers<typeof target, typeof extra> = {
            defaultAction: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableObject(target, handlers, true, extra);
        const value = proxy.a;

        expect(handlers.defaultAction).toHaveBeenCalledWith(target, 'a', extra);
        expect(value).toBe(1);
    });

    it('should handle absence of extra parameter gracefully', () => {
        const target = { a: 1 };
        const handlers: ObjectHandlers<typeof target> = {
            set: jest.fn().mockReturnValue(true),
        };

        const proxy = createObservableObject(target, handlers);
        proxy.a = 2;

        expect(handlers.set).toHaveBeenCalledWith(target, 'a', 2, undefined);
        expect(target.a).toBe(2);
    });
});


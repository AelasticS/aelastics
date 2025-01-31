export interface ObjectHandlers<T extends object, P extends {} = {}> {
    set?: (target: T, key: string | number | symbol, value: any, extra?: P) => boolean;
    delete?: (target: T, key: string | number | symbol, extra?: P) => boolean;
    method?: (target: T, key: string | number | symbol, args: any[], extra?: P) => boolean;
    defaultAction?: (target: T, key: PropertyKey, extra?: P) => boolean;
}

export function createObservableObject<T extends object, P extends {} = {}>(
    obj: T,
    handlers: ObjectHandlers<T, P>,
    defaultMutation: boolean = true,
    extra?: P
): T {
    return new Proxy(obj, {
        set(target: T, key: string | number | symbol, value: any, receiver: any): boolean {
            if (handlers.set) {
                const allowMutation = handlers.set(target, key, value, extra);
                if (allowMutation) {
                    Reflect.set(target, key, value, receiver);
                }
            } else if (defaultMutation) {
                Reflect.set(target, key, value, receiver);
            }
            return true;
        },
        deleteProperty(target: T, key: string | number | symbol): boolean {
            if (handlers.delete) {
                const allowMutation = handlers.delete(target, key, extra);
                if (allowMutation || defaultMutation) {
                    Reflect.deleteProperty(target, key);
                }
            } else if (defaultMutation) {
                Reflect.deleteProperty(target, key);
            }
            return true;
        },
        get(target: T, key: string | number | symbol, receiver: any): any {
            const origProp = Reflect.get(target, key, receiver);

            if (typeof origProp === 'function' && handlers.method) {
                return (...args: any[]) => {
                    const allowCall = handlers.method!(target, key, args, extra);
                    if (allowCall) {
                        return origProp.apply(receiver, args);
                    }
                };
            }

            if (handlers.defaultAction) {
                const allowDefault = handlers.defaultAction(target, key, extra);
                if (!allowDefault) {
                    return undefined;
                }
            }

            return origProp;
        }
    });
}

export interface ObjectHandlers<T extends object> {
    set?: (target: T, key: string | number | symbol, value: any) => boolean;
    delete?: (target: T, key: string | number | symbol) => boolean;
    method?: (target: T, key: string | number | symbol, args: any[]) => boolean;
    defaultAction?: (target: T, key: PropertyKey) => boolean;
}

export function createObservableObject<T extends object>(
  obj: T,
  handlers: ObjectHandlers<T>,
  defaultMutation: boolean = true
): T {
    return new Proxy(obj, {
        set(target: T, key: string | number | symbol, value: any, receiver: any): boolean {
            if (handlers.set) {
                const allowMutation = handlers.set(target, key, value);
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
                const allowMutation = handlers.delete(target, key);
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
            
            if (typeof origProp === 'function' && handlers.method != undefined) {
                return (...args: any[]) => {
                    const allowCall = handlers.method!(target, key, args);
                    if (allowCall) {
                        return origProp.apply(receiver, args);
                    }
                };
            }

            if (handlers.defaultAction) {
                const allowDefault = handlers.defaultAction(target, key);
                if (!allowDefault) {
                    return undefined;
                }
            }
            
            return origProp;
        }
    });
}

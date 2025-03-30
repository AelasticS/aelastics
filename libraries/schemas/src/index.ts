// index.ts
import * as originalZod from 'zod';
import { wrapZod } from './ZodWrapper';

// Wrap all methods transparently:
// const wrap = <T>(schema: originalZod.ZodType<T>) => cyclicSafe(schema);

// Re-export the entire Zod API transparently, wrapping schema constructors
interface IZodWrapper {
    object: <T extends originalZod.ZodRawShape>(shape: T) => originalZod.ZodObject<T>;
    array: <T>(schema: originalZod.ZodType<T>) => originalZod.ZodArray<originalZod.ZodType<T>>;
    union: <T extends [originalZod.ZodTypeAny, ...originalZod.ZodTypeAny[]]>(...options: T) => originalZod.ZodUnion<T>;
    intersection: <T extends originalZod.ZodTypeAny, U extends originalZod.ZodTypeAny>(
        left: T,
        right: U
    ) => originalZod.ZodIntersection<T, U>;
    record: <K extends originalZod.ZodTypeAny, V extends originalZod.ZodTypeAny>(
        keySchema: K,
        valSchema: V
    ) => originalZod.ZodRecord<K, V>;
    set: <T>(valueSchema: originalZod.ZodType<T>) => originalZod.ZodSet<originalZod.ZodType<T>>;
    map: <K, V>(
        keySchema: originalZod.ZodType<K>,
        valueSchema: originalZod.ZodType<V>
    ) => originalZod.ZodMap<originalZod.ZodType<K>, originalZod.ZodType<V>>;
    lazy: <T>(getter: () => originalZod.ZodType<T>) => originalZod.ZodLazy<T>;
    string: typeof originalZod.string;
    number: typeof originalZod.number;
    boolean: typeof originalZod.boolean;
}

export const z: IZodWrapper = {
    object: (shape) => wrapZod(originalZod.object(shape)) as originalZod.ZodObject<typeof shape>,
    array: <T>(schema: originalZod.ZodType<T>) => wrapZod(originalZod.array(schema)) as originalZod.ZodArray<originalZod.ZodType<T>>,
    union: (...options) => wrap(originalZod.union(options)),
    intersection: (left, right) => wrap(originalZod.intersection(left, right)),
    record: (keySchema, valSchema) => wrap(originalZod.record(keySchema, valSchema)),
    set: (valueSchema) => wrap(originalZod.set(valueSchema)),
    map: (keySchema, valueSchema) => wrap(originalZod.map(keySchema, valueSchema)),
    lazy: (getter) => wrap(originalZod.lazy(getter)),
    string: originalZod.string,
    number: originalZod.number,
    boolean: originalZod.boolean,
};

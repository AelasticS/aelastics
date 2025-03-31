/* eslint-disable @rushstack/typedef-var */
// index.ts
import { z as originalZod} from "zod";
import { wrapZod } from "./ZodWrapper"

// Wrap all methods transparently:
// const wrap = <T>(schema: originalZod.ZodType<T>) => cyclicSafe(schema);

// Re-export the entire Zod API transparently, wrapping schema constructors
// interface IZodWrapper {
//   object?: <T extends originalZod.ZodRawShape>(shape: T) => originalZod.ZodObject<T>
//   array?: <T>(schema: originalZod.ZodType<T>) => originalZod.ZodArray<originalZod.ZodType<T>>
//   union?: <T extends [originalZod.ZodTypeAny, originalZod.ZodTypeAny, ...originalZod.ZodTypeAny[]]>(
//     ...options: T
//   ) => originalZod.ZodUnion<T>
//   intersection?: <T extends originalZod.ZodTypeAny, U extends originalZod.ZodTypeAny>(
//     left: T,
//     right: U
//   ) => originalZod.ZodIntersection<T, U>
//   record?: <K extends originalZod.ZodTypeAny, V extends originalZod.ZodTypeAny>(
//     keySchema: K,
//     valSchema: V
//   ) => originalZod.ZodRecord<K, V>
//   set?: <T>(valueSchema: originalZod.ZodType<T>) => originalZod.ZodSet<originalZod.ZodType<T>>
//   map?: <K, V>(
//     keySchema: originalZod.ZodType<K>,
//     valueSchema: originalZod.ZodType<V>
//   ) => originalZod.ZodMap<originalZod.ZodType<K>, originalZod.ZodType<V>>
//   lazy?: <T extends originalZod.ZodTypeAny>(getter: () => T) => originalZod.ZodLazy<T>
//   string?: () => originalZod.ZodString
//   number?: () => originalZod.ZodNumber
//   boolean?: () => originalZod.ZodBoolean
//   bigint?: () => originalZod.ZodBigInt
//   date?: () => originalZod.ZodDate
//   undefined?: () => originalZod.ZodUndefined
//   null?: () => originalZod.ZodNull
//   any?: () => originalZod.ZodAny
//   unknown?: () => originalZod.ZodUnknown
//   never?: () => originalZod.ZodNever
//   void?: () => originalZod.ZodVoid
//   literal?: <T extends originalZod.Primitive>(value: T) => originalZod.ZodLiteral<T>
//   enum?: <T extends [string, ...string[]]>(values: T) => originalZod.ZodEnum<T>
//   nativeEnum?: <T extends originalZod.EnumLike>(enumObj: T) => originalZod.ZodNativeEnum<T>
//   tuple?: <T extends [originalZod.ZodTypeAny, ...originalZod.ZodTypeAny[]]>(items: T) => originalZod.ZodTuple<T>
//   optional?: <T extends originalZod.ZodTypeAny>(schema: T) => originalZod.ZodOptional<T>
//   nullable?: <T extends originalZod.ZodTypeAny>(schema: T) => originalZod.ZodNullable<T>
//   default?: <T extends originalZod.ZodTypeAny>(
//     schema: T,
//     defaultValue: originalZod.input<T>
//   ) => originalZod.ZodDefault<T>
//   effects?: <T extends originalZod.ZodTypeAny>(
//     schema: T,
//     effect: originalZod.ZodEffects<any>
//   ) => originalZod.ZodEffects<T>
//   discriminatedUnion?: <
//     K extends string,
//     T extends readonly [originalZod.ZodDiscriminatedUnionOption<K>, ...originalZod.ZodDiscriminatedUnionOption<K>[]]
//   >(
//     discriminator: K,
//     options: T,
//     params?: originalZod.RawCreateParams
//   ) => originalZod.ZodDiscriminatedUnion<K, T>
//   preprocess?: <T extends originalZod.ZodTypeAny>(
//     preprocess: (arg: unknown) => unknown,
//     schema: T
//   ) => originalZod.ZodEffects<T>
//   transform?: <T extends originalZod.ZodTypeAny, Output>(
//     schema: T,
//     transform: (arg: originalZod.input<T>) => Output
//   ) => originalZod.ZodEffects<T, Output>
//   refine?: <T extends originalZod.ZodTypeAny>(
//     schema: T,
//     check: (data: originalZod.input<T>) => boolean | Promise<boolean>,
//     message?: string | ((data: originalZod.input<T>) => string)
//   ) => T
//   superRefine?: <T extends originalZod.ZodTypeAny>(
//     schema: T,
//     refine: (data: originalZod.input<T>, ctx: originalZod.RefinementCtx) => void | Promise<void>
//   ) => T
//   catch?: <T extends originalZod.ZodTypeAny>(schema: T, fallback: originalZod.input<T>) => originalZod.ZodEffects<T>
//   brand?: <T extends originalZod.ZodTypeAny, B>(schema: T) => originalZod.ZodBranded<T, B>
//   is?: <T extends originalZod.ZodTypeAny>(schema: T, data: unknown) => data is originalZod.input<T>
//   check?: <T extends originalZod.ZodTypeAny>(schema: T, data: unknown) => boolean
//   parseAsync?: <T extends originalZod.ZodTypeAny>(schema: T, data: unknown) => Promise<originalZod.output<T>>
//   safeParseAsync?: <T extends originalZod.ZodTypeAny>(
//     schema: T,
//     data: unknown
//   ) => Promise<originalZod.SafeParseReturnType<originalZod.input<T>, originalZod.output<T>>>
// }

export const z /*: IZodWrapper */ = {
  ...originalZod,
  object: (shape: any) => wrapZod(originalZod.object(shape)) as originalZod.ZodObject<typeof shape>,
  array: (schema:any) => wrapZod(originalZod.array(schema)) as originalZod.ZodArray<typeof schema>,
  union: <T extends [originalZod.ZodTypeAny, originalZod.ZodTypeAny, ...originalZod.ZodTypeAny[]]>(...options: T) =>
    wrapZod(originalZod.union(options)) as originalZod.ZodUnion<T>,
  intersection: <T extends originalZod.ZodTypeAny, U extends originalZod.ZodTypeAny>(left: T, right: U) =>
    wrapZod(originalZod.intersection(left, right)) as originalZod.ZodIntersection<T, U>,
  record: <K extends originalZod.ZodTypeAny, V extends originalZod.ZodTypeAny>(keySchema: K, valSchema: V) =>
    wrapZod(originalZod.record(keySchema, valSchema)) as originalZod.ZodRecord<K, V>,
  set: <T>(valueSchema: originalZod.ZodType<T>) =>
    wrapZod(originalZod.set(valueSchema)) as originalZod.ZodSet<originalZod.ZodType<T>>,
  map: <K, V>(keySchema: originalZod.ZodType<K>, valueSchema: originalZod.ZodType<V>) =>
    wrapZod(originalZod.map(keySchema, valueSchema)) as originalZod.ZodMap<
      originalZod.ZodType<K>,
      originalZod.ZodType<V>
    >,
  lazy: <T extends originalZod.ZodTypeAny>(getter: () => T) =>
    wrapZod(originalZod.lazy(getter)) as originalZod.ZodLazy<T>,
  string: () => wrapZod(originalZod.string()) as originalZod.ZodString,
  number: () => wrapZod(originalZod.number()) as originalZod.ZodNumber,
  boolean: () => wrapZod(originalZod.boolean()) as originalZod.ZodBoolean,
  bigint: () => wrapZod(originalZod.bigint()) as originalZod.ZodBigInt,
  date: () => wrapZod(originalZod.date()) as originalZod.ZodDate,
  undefined: () => wrapZod(originalZod.undefined()) as originalZod.ZodUndefined,
  null: () => wrapZod(originalZod.null()) as originalZod.ZodNull,
  any: () => wrapZod(originalZod.any()) as originalZod.ZodAny,
  unknown: () => wrapZod(originalZod.unknown()) as originalZod.ZodUnknown,
  never: () => wrapZod(originalZod.never()) as originalZod.ZodNever,
  void: () => wrapZod(originalZod.void()) as originalZod.ZodVoid,
  literal: <T extends originalZod.Primitive>(value: T) =>
    wrapZod(originalZod.literal(value)) as originalZod.ZodLiteral<T>,
  enum: <T extends [string, ...string[]]>(values: T) => wrapZod(originalZod.enum(values)) as originalZod.ZodEnum<T>,
  nativeEnum: <T extends originalZod.EnumLike>(enumObj: T) =>
    wrapZod(originalZod.nativeEnum(enumObj)) as originalZod.ZodNativeEnum<T>,
  tuple: <T extends [originalZod.ZodTypeAny, ...originalZod.ZodTypeAny[]]>(items: T) =>
    wrapZod(originalZod.tuple(items)) as originalZod.ZodTuple<T>,
  optional: <T extends originalZod.ZodTypeAny>(schema: T) =>
    wrapZod(originalZod.optional(schema)) as originalZod.ZodOptional<T>,
  nullable: <T extends originalZod.ZodTypeAny>(schema: T) =>
    wrapZod(originalZod.nullable(schema)) as originalZod.ZodNullable<T>,
   discriminatedUnion: <K extends string, T extends readonly [originalZod.ZodDiscriminatedUnionOption<K>, ...originalZod.ZodDiscriminatedUnionOption<K>[]]>(
    discriminator: K,
    options: T,
    params?: originalZod.RawCreateParams
  ) =>
    wrapZod(originalZod.discriminatedUnion(discriminator, options, params)) as originalZod.ZodDiscriminatedUnion<K, T>,

  effects: <T extends originalZod.ZodTypeAny>(
    schema: T,
    effect: originalZod.ZodEffects<any>
  ): originalZod.ZodEffects<T> => {
    return wrapZod(originalZod.effect(schema, effect as any)) as originalZod.ZodEffects<T>;
  },
  default: <T extends originalZod.ZodTypeAny>(schema: T, defaultValue: originalZod.input<T>) =>
    wrapZod((originalZod as any).default(schema, defaultValue)) as originalZod.ZodDefault<T>,

  preprocess: <T extends originalZod.ZodTypeAny>(preprocess: (arg: unknown) => unknown, schema: T) => {
    return originalZod.preprocess(preprocess, wrapZod(schema)) as originalZod.ZodEffects<T>
  }
   ,
}

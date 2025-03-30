import {
  ZodType,
  ParseInput,
  ParseReturnType,
  ZodObject,
  ZodArray,
  ZodUnion,
  ZodIntersection,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodLazy,
  ZodEffects,
  ZodDefault,
  ZodNullable,
  ZodOptional,
  ZodTuple,
  ZodEnum,
  ZodDiscriminatedUnion,
  ZodLiteral,
  ZodNativeEnum,
  ZodString,
  ZodNumber,
  ZodBoolean,
  ZodBigInt,
  ZodDate,
  ZodNull,
  ZodUndefined,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  SyncParseReturnType,
} from 'zod';

export function wrapZod<T>(schema: ZodType<T>): ZodType<T> {
  class ZodCycleSafe extends ZodType<T> {
    public constructor() {
      super(schema._def);
    }

    public _parse(input: ParseInput): ParseReturnType<T> {
      const seen = new WeakSet();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cyclicParse = (schema: ZodType<any>, data: any, path: (string | number)[]): SyncParseReturnType<any> => {
        if (typeof data === 'object' && data !== null) {
          if (seen.has(data)) {
            return { status: 'valid', value: data } as SyncParseReturnType<T>;
          }
          seen.add(data);
        }

        const result = schema._parseSync(input);
        if (result.status !== 'valid') return result;

        switch (true) {
          case schema instanceof ZodObject:
            for (const key in schema.shape) {
              if (Object.prototype.hasOwnProperty.call(schema.shape, key)) {
                const childResult = cyclicParse(schema.shape[key], data[key], [...path, key]);
                if (childResult.status !== 'valid') return childResult;
              }
            }
            break;

          case schema instanceof ZodArray:
            for (let i = 0; i < data.length; i++) {
              const elementResult = cyclicParse(schema.element, data[i], [...path, i]);
              if (elementResult.status !== 'valid') return elementResult;
            }
            break;

          case schema instanceof ZodUnion:
            for (const option of schema.options) {
              const optionResult = cyclicParse(option, data, path);
              if (optionResult.status === 'valid') return optionResult;
            }
            return result;

          case schema instanceof ZodIntersection:
            const leftResult = cyclicParse(schema._def.left, data, path);
            if (leftResult.status !== 'valid') return leftResult;
            const rightResult = cyclicParse(schema._def.right, data, path);
            if (rightResult.status !== 'valid') return rightResult;
            break;

          case schema instanceof ZodLazy:
            return cyclicParse(schema._def.getter(), data, path);

          case schema instanceof ZodEffects:
            return cyclicParse(schema.innerType(), data, path);

          case schema instanceof ZodRecord:
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
                const valResult = cyclicParse(schema._def.valueType, data[key], [...path, key]);
                if (valResult.status !== 'valid') return valResult;
              }
            }
            break;

          case schema instanceof ZodMap:
            for (const [key, val] of data.entries()) {
              const keyResult = cyclicParse(schema._def.keyType, key, [...path, 'key']);
              if (keyResult.status !== 'valid') return keyResult;
              const valResult = cyclicParse(schema._def.valueType, val, [...path, 'value']);
              if (valResult.status !== 'valid') return valResult;
            }
            break;

          case schema instanceof ZodSet:
            for (const val of data.values()) {
              const valResult = cyclicParse(schema._def.valueType, val, [...path, 'value']);
              if (valResult.status !== 'valid') return valResult;
            }
            break;

          case schema instanceof ZodTuple:
            for (let i = 0; i < schema.items.length; i++) {
              const itemResult = cyclicParse(schema.items[i], data[i], [...path, i]);
              if (itemResult.status !== 'valid') return itemResult;
            }
            break;

          case schema instanceof ZodOptional:
          case schema instanceof ZodNullable:
          case schema instanceof ZodDefault:
            return cyclicParse(schema._def.innerType, data, path);

          case schema instanceof ZodDiscriminatedUnion:
            const discriminatorValue = data[schema._def.discriminator];
            const optionSchema = schema._def.optionsMap.get(discriminatorValue);
            
            if (!optionSchema) {
              throw new Error(`Invalid discriminator value: ${discriminatorValue}`);
            }
            
            return cyclicParse(optionSchema, data, path);
            

          case schema instanceof ZodString:
          case schema instanceof ZodNumber:
          case schema instanceof ZodBoolean:
          case schema instanceof ZodBigInt:
          case schema instanceof ZodDate:
          case schema instanceof ZodNull:
          case schema instanceof ZodUndefined:
          case schema instanceof ZodAny:
          case schema instanceof ZodUnknown:
          case schema instanceof ZodNever:
          case schema instanceof ZodVoid:
          case schema instanceof ZodLiteral:
          case schema instanceof ZodEnum:
          case schema instanceof ZodNativeEnum:
            break; // Already validated above in schema._parseSync

          default:
            throw new Error(`Unsupported schema type at path ${path.join('.')}`);
        }

        return result;
      };

      return cyclicParse(schema, input.data, input.path);
    }
  }

  return new ZodCycleSafe();
}
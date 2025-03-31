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
  ZodDiscriminatedUnionOption,
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
            // Explicitly cast schema to ZodObject to access the shape property
            const zodObject = schema as ZodObject<any, any, any, any, any>;
            for (const key in zodObject.shape) {
              if (Object.prototype.hasOwnProperty.call(zodObject.shape, key)) {
                const childResult = cyclicParse(zodObject.shape[key], data[key], [...path, key]);
                if (childResult.status !== 'valid') return childResult;
              }
            }
            break;

            case schema instanceof ZodArray:
            const zodArray = schema as ZodArray<any>;
            for (let i = 0; i < data.length; i++) {
              const elementResult = cyclicParse(zodArray.element, data[i], [...path, i]);
              if (elementResult.status !== 'valid') return elementResult;
            }
            break;

            case schema instanceof ZodUnion:
            const zodUnion = schema as ZodUnion<any>;
            for (const option of zodUnion.options) {
              const optionResult = cyclicParse(option, data, path);
              if (optionResult.status === 'valid') return optionResult;
            }
            return result;

            case schema instanceof ZodIntersection:
            const zodIntersection = schema as ZodIntersection<any, any>;
            const leftResult = cyclicParse(zodIntersection._def.left, data, path);
            if (leftResult.status !== 'valid') return leftResult;
            const rightResult = cyclicParse(zodIntersection._def.right, data, path);
            if (rightResult.status !== 'valid') return rightResult;
            break;

            case schema instanceof ZodLazy:
            return cyclicParse((schema as ZodLazy<any>)._def.getter(), data, path);

            case schema instanceof ZodEffects:
            return cyclicParse((schema as ZodEffects<any>).innerType(), data, path);

            case schema instanceof ZodRecord:
            const zodRecord = schema as ZodRecord<any, any>;
            for (const key in data) {
              if (Object.prototype.hasOwnProperty.call(data, key)) {
              const valResult = cyclicParse(zodRecord._def.valueType, data[key], [...path, key]);
              if (valResult.status !== 'valid') return valResult;
              }
            }
            break;

            case schema instanceof ZodMap:
            const zodMap = schema as ZodMap<any, any>;
            for (const [key, val] of data.entries()) {
              const keyResult = cyclicParse(zodMap._def.keyType, key, [...path, 'key']);
              if (keyResult.status !== 'valid') return keyResult;
              const valResult = cyclicParse(zodMap._def.valueType, val, [...path, 'value']);
              if (valResult.status !== 'valid') return valResult;
            }
            break;

            case schema instanceof ZodSet:
            const zodSet = schema as ZodSet<any>;
            for (const val of data.values()) {
              const valResult = cyclicParse(zodSet._def.valueType, val, [...path, 'value']);
              if (valResult.status !== 'valid') return valResult;
            }
            break;

            case schema instanceof ZodTuple:
            const zodTuple = schema as ZodTuple<any>;
            for (let i = 0; i < zodTuple.items.length; i++) {
              const itemResult = cyclicParse(zodTuple.items[i], data[i], [...path, i]);
              if (itemResult.status !== 'valid') return itemResult;
            }
            break;

          case schema instanceof ZodOptional:
          case schema instanceof ZodNullable:
          case schema instanceof ZodDefault:
            return cyclicParse((schema._def as any).innerType, data, path);

            case schema instanceof ZodDiscriminatedUnion:
            const zodDiscriminatedUnion = schema as ZodDiscriminatedUnion<string, ZodDiscriminatedUnionOption<string>[]>;
            const discriminatorValue = data[zodDiscriminatedUnion._def.discriminator];
            const optionSchema = zodDiscriminatedUnion._def.optionsMap.get(discriminatorValue);
            
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
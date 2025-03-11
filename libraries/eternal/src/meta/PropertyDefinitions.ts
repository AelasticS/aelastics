/** Defines allowed property types */
export type ComplexPropType = 'object' | 'array' | 'map' | 'set';
export type SimplePropType = 'string' | 'number' | 'boolean' | 'date';

/**
 * Function to check if a value belongs to SimplePropType
 */
export function isSimplePropType(value: any): value is SimplePropType {
    return ['string', 'number', 'boolean', 'date'].includes(value);
}

/**
 * Function to check if a value belongs to ComplexPropType
 */
export function isComplexPropType(value: any): value is ComplexPropType {
    return ['object', 'array', 'map', 'set'].includes(value); // TODO add intersection type, union type, tuple type, etc
}

export type PropertyType = SimplePropType | ComplexPropType;

import { TypeSchema, LinkType, link, Type, object } from '../index';
import { ServiceError } from 'aelastics-result';

describe('link function tests', () => {
    let schema: TypeSchema;
    let owner: TypeSchema;

    beforeEach(() => {
        schema = new TypeSchema('TestSchema');
        owner = new TypeSchema('OwnerSchema');
    });

    test('should create a new LinkType when it does not exist', () => {
        const path = 'some/path';
        const name = 'TestLink';
        const result = link(schema, path, name, owner);

        expect(result).toBeInstanceOf(LinkType);
        expect(result.name).toBe(name);
        expect(result.LinkSchema).toBe(schema);
        expect(result.path).toBe(path);
        expect(result.ownerSchema).toBe(owner);
    });

    test('should create a new LinkType with generated name when name is not provided', () => {
        const path = 'some/path';
        const result = link(schema, path);

        expect(result).toBeInstanceOf(LinkType);
        expect(result.name).toBe(Type.sanitizeName(`LinkTo_${schema.absolutePathName}/${path}`));
        expect(result.LinkSchema).toBe(schema);
        expect(result.path).toBe(path);
        expect(result.ownerSchema).toBe(schema);
    });

    test('should return existing LinkType if it matches the absolute path name', () => {
        const path = 'some/path';
        const name = 'TestLink';
        const existingLink = link(schema, path, name, owner);
        const result = link(schema, path, name, owner);
        expect(result).toBe(existingLink);
    });

    test('should throw error if existing LinkType has different absolute path name', () => {
        const path = 'some/path';
        const name = 'TestLink';
        const existingLink = link(schema, 'different/path', name, owner);
        expect(() => link(schema, path, name, owner)).toThrow(ServiceError);
    });

    test('should throw error if existing type with the same name is not a LinkType', () => {
        const path = 'some/path';
        const name = 'TestLink';
        const existingType = object({}, name, schema);

        expect(() => link(schema, path, name, schema)).toThrow(ServiceError);
    });
});
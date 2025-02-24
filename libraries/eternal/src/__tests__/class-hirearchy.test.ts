import { EternalStore } from '../EternalStore';
import { TypeMeta } from '../handlers/MetaDefinitions';
import { EternalObject } from '../handlers/InternalTypes';

describe('EternalStore Dynamic Class Creation', () => {
  it('should dynamically create a hierarchy of classes', () => {
    // Define type metadata for the hierarchy
    const typeMetaA: TypeMeta = {
      name: 'TypeA',
      properties: new Map([
        ['propA', { name: 'propA', type: 'string' }]
      ])
    };

    const typeMetaB: TypeMeta = {
      name: 'TypeB',
      extends: 'TypeA',
      properties: new Map([
        ['propB', { name: 'propB', type: 'number' }]
      ])
    };

    const typeMetaC: TypeMeta = {
      name: 'TypeC',
      extends: 'TypeB',
      properties: new Map([
        ['propC', { name: 'propC', type: 'boolean' }]
      ])
    };

    // Create metaInfo map
    const metaInfo = new Map<string, TypeMeta>([
      ['TypeA', typeMetaA],
      ['TypeB', typeMetaB],
      ['TypeC', typeMetaC]
    ]);

    // Initialize EternalStore with metaInfo
    const store = new EternalStore(metaInfo);

    // Create objects of each type
    const objA = store.createObject<EternalObject>('TypeA');
    const objB = store.createObject<EternalObject>('TypeB');
    const objC = store.createObject<EternalObject>('TypeC');

    // Check if objects are instances of their respective classes
    expect(objA).toBeInstanceOf(store.getClassByName('TypeA'));
    expect(objB).toBeInstanceOf(store.getClassByName('TypeB'));
    expect(objC).toBeInstanceOf(store.getClassByName('TypeC'));

    // Check if objects have the correct properties
    expect(objA).toHaveProperty('propA');
    expect(objB).toHaveProperty('propA');
    expect(objB).toHaveProperty('propB');
    expect(objC).toHaveProperty('propA');
    expect(objC).toHaveProperty('propB');
    expect(objC).toHaveProperty('propC');
  });
});
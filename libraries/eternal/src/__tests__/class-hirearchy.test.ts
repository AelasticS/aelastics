import { EternalStore } from '../EternalStore';
import { TypeMeta } from '../meta/InternalSchema';
import { EternalObject } from '../handlers/InternalTypes';

// Define type metadata for the hierarchy
const typeMetaA: TypeMeta = {
  qName: 'TypeA',
  properties: new Map([
    ['propA', { name: 'propA', type: 'string', qName: 'propA' }],
    ['propArray', { name: 'propArray', type: 'array', qName: 'propArray' }]
  ])
};

const typeMetaB: TypeMeta = {
  qName: 'TypeB',
  extends: 'TypeA',
  properties: new Map([
    ['propB', { name: 'propB', type: 'number', qName: 'propB' }]
  ])
};

const typeMetaC: TypeMeta = {
  qName: 'TypeC',
  extends: 'TypeB',
  properties: new Map([
    ['propC', { name: 'propC', type: 'boolean', qName: 'propC' }]
  ])
};

// Create metaInfo map
const metaInfo = new Map<string, TypeMeta>([
  ['TypeA', typeMetaA],
  ['TypeB', typeMetaB],
  ['TypeC', typeMetaC]
]);

describe('EternalStore Dynamic Class Creation', () => {
  let store: EternalStore;

  beforeAll(() => {
    // Initialize EternalStore with metaInfo
    store = new EternalStore(metaInfo);
  });

  it('should dynamically create a hierarchy of classes', () => {
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
    expect(objA).toHaveProperty('propArray');
    
    expect(objB).toHaveProperty('propA');
    expect(objB).toHaveProperty('propArray');
    expect(objB).toHaveProperty('propB');

    expect(objC).toHaveProperty('propA');
    expect(objC).toHaveProperty('propArray');
    expect(objC).toHaveProperty('propB');
    expect(objC).toHaveProperty('propC');
  });

  it('should clone objects correctly in a hierarchy of classes', () => {
    // Create an object of type 'TypeC'
    let objC = store.createObject<EternalObject>('TypeC');
    objC = store.produce((o) => {
      o.propA = 'valueA';
      o.propB = 42;
      o.propC = true;
      o.propArray.push(1, 2, 3);
    }, objC)!


    // Clone the object
    const clonedObjC = objC.clone();

    // Check if the cloned object is an instance of the correct class
    expect(clonedObjC).toBeInstanceOf(store.getClassByName('TypeC'));

    // Check if the cloned object has the same properties as the original
    expect(clonedObjC).toHaveProperty('propA', 'valueA');
    expect(clonedObjC).toHaveProperty('propB', 42);
    expect(clonedObjC).toHaveProperty('propC', true);
    expect(clonedObjC).toHaveProperty('propArray', [1, 2, 3]);
    
    // Check if the array property has the same size
    expect(clonedObjC.propArray.length).toBe(objC.propArray.length);

    // Check if the cloned object has same UUID
    expect(clonedObjC.uuid).toBe(objC.uuid);
    // Check if the cloned object if different
    expect(clonedObjC).not.toBe(objC);

  });
});
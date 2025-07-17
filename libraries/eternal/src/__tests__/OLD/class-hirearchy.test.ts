import { createStore } from '../store/createStore';
import { StoreObject, uuid } from '../store/InternalTypes';
import { RegistryService } from '../registry/RegistryService';
import { Namespace, RegistryMetadata } from '../registry/NamespaceMetadata';
import { ObjectTypeMeta, PropertyMeta } from '../registry/TypeDefinitions';

// Create type definitions using the new registry system
function createHierarchyNamespace(): Namespace {
  const typeMetaA: ObjectTypeMeta = {
    qName: '/test/TypeA',
    category: 'complex',
    kind: 'object',
    properties: new Map([
      ['propA', {
        name: 'propA',
        typeRef: '/std/string',
        optional: false
      } as PropertyMeta],
      ['propArray', {
        name: 'propArray',
        typeRef: '/std/array</std/string>',
        optional: false
      } as PropertyMeta]
    ])
  };

  const typeMetaB: ObjectTypeMeta = {
    qName: '/test/TypeB',
    category: 'complex',
    kind: 'object',
    extends: '/test/TypeA',
    properties: new Map([
      ['propB', {
        name: 'propB',
        typeRef: '/std/number',
        optional: false
      } as PropertyMeta]
    ])
  };

  const typeMetaC: ObjectTypeMeta = {
    qName: '/test/TypeC',
    category: 'complex',
    kind: 'object',
    extends: '/test/TypeB',
    properties: new Map([
      ['propC', {
        name: 'propC',
        typeRef: '/std/boolean',
        optional: false
      } as PropertyMeta]
    ])
  };

  return {
    qName: '/test',
    version: '1.0.0',
    types: new Map([
      ['TypeA', typeMetaA],
      ['TypeB', typeMetaB],
      ['TypeC', typeMetaC]
    ]),
    exports: ['TypeA', 'TypeB', 'TypeC'],
    imports: new Map()
  };
}

describe('EternalStore Dynamic Class Creation', () => {
  let store: ReturnType<typeof createStore>;

  beforeAll(() => {
    const registryMetadata: RegistryMetadata = {
      namespaces: new Map(),
      name: 'Test Registry',
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date()
    };
    
    const registry = new RegistryService(registryMetadata);
    const namespace = createHierarchyNamespace();
    
    registry.importNamespace(namespace);
    store = createStore(registry);
  });

  it('should dynamically create a hierarchy of classes', () => {
    // Create objects of each type
    const objA = store.objects.create<StoreObject>('/test/TypeA');
    const objB = store.objects.create<StoreObject>('/test/TypeB');
    const objC = store.objects.create<StoreObject>('/test/TypeC');

    // Check if objects are instances of their respective classes
    expect(objA).toBeInstanceOf(store.getEternalStore().getClassByName('/test/TypeA'));
    expect(objB).toBeInstanceOf(store.getEternalStore().getClassByName('/test/TypeB'));
    expect(objC).toBeInstanceOf(store.getEternalStore().getClassByName('/test/TypeC'));

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
    let objC = store.objects.create<StoreObject>('/test/TypeC');
    objC = store.objects.update((o) => {
      o.propA = 'valueA';
      o.propB = 42;
      o.propC = true;
      o.propArray.push(1, 2, 3);
    }, objC)!


    // Clone the object
    const clonedObjC = objC.clone();

    // Check if the cloned object is an instance of the correct class
    expect(clonedObjC).toBeInstanceOf(store.getEternalStore().getClassByName('/test/TypeC'));

    // Check if the cloned object has the same properties as the original
    expect(clonedObjC).toHaveProperty('propA', 'valueA');
    expect(clonedObjC).toHaveProperty('propB', 42);
    expect(clonedObjC).toHaveProperty('propC', true);
    expect(clonedObjC).toHaveProperty('propArray', [1, 2, 3]);
    
    // Check if the array property has the same size
    expect(clonedObjC.propArray.length).toBe(objC.propArray.length);

    // Check if the cloned object has same UUID
    expect(clonedObjC[uuid]).toBe(objC[uuid]);
    // Check if the cloned object if different
    expect(clonedObjC).not.toBe(objC);

  });
});
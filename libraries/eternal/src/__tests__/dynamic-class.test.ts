import { createStore } from '../store/createStore';
import { RegistryService } from '../registry/RegistryService';
import { Namespace, RegistryMetadata } from '../registry/NamespaceMetadata';
import { ObjectTypeMeta, PropertyMeta } from '../registry/TypeDefinitions';

// Create user schema using the new registry system
function createUserNamespace(): Namespace {
  const userTypeMeta: ObjectTypeMeta = {
    qName: '/test/User',
    category: 'complex',
    kind: 'object',
    properties: new Map([
      ['id', {
        name: 'id',
        typeRef: '/std/string',
        optional: false
      } as PropertyMeta],
      ['name', {
        name: 'name',
        typeRef: '/std/string',
        optional: false
      } as PropertyMeta],
      ['age', {
        name: 'age',
        typeRef: '/std/number',
        optional: false
      } as PropertyMeta],
      ['friends', {
        name: 'friends',
        typeRef: '/std/array</test/User>',
        optional: false,
        inverseProp: 'friends',
        inverseTypeRef: '/test/User',
        inverseType: 'array'
      } as PropertyMeta]
    ])
  };

  const postTypeMeta: ObjectTypeMeta = {
    qName: '/test/Post',
    category: 'complex',
    kind: 'object',
    properties: new Map([
      ['id', {
        name: 'id',
        typeRef: '/std/string',
        optional: false
      } as PropertyMeta],
      ['title', {
        name: 'title',
        typeRef: '/std/string',
        optional: false
      } as PropertyMeta],
      ['author', {
        name: 'author',
        typeRef: '/test/User',
        optional: false,
        inverseProp: 'posts',
        inverseTypeRef: '/test/User',
        inverseType: 'array'
      } as PropertyMeta]
    ])
  };

  return {
    qName: '/test',
    version: '1.0.0',
    types: new Map([
      ['User', userTypeMeta],
      ['Post', postTypeMeta]
    ]),
    exports: ['User', 'Post'],
    imports: new Map()
  };
}

describe('EternalStore', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    const registryMetadata: RegistryMetadata = {
      namespaces: new Map(),
      name: 'Test Registry',
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date()
    };
    
    const registry = new RegistryService(registryMetadata);
    const namespace = createUserNamespace();
    
    registry.importNamespace(namespace);
    store = createStore(registry);
  });

  it('should create a dynamic class with the correct name', () => {
    const DynamicClass = store.getEternalStore().getClassByName('/test/User');
    const instance = new DynamicClass();

    expect(instance.constructor.name).toBe('User');
  });
});
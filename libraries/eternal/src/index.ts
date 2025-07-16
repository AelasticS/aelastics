export { IStore as Store } from './interfaces/IStore';
export { applyJsonPatch, generateJsonPatch} from "./events/ChangeLog";
export { createStore } from './store/createStore';
export { RegistryService } from './registry/RegistryService';
export { RegistryMetadata, Namespace } from './registry/NamespaceMetadata';
export { TypeMeta, ObjectTypeMeta, PropertyMeta } from './registry/TypeDefinitions';
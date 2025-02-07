import { EternalStore, InternalRecipe } from "./EternalStore";
import { InternalObjectProps } from "./handlers/InternalTypes";
import { TypeMeta } from "./handlers/MetaDefinitions";

export interface Store {
    createObject<T extends object>(type: string): T;
    produce<T>(recipe: recipe<T>, obj: T): T;
    getObject<T extends object>(uuid: string): T | undefined;
}

export type recipe<T> = (obj: T) => void

export function createStore(
    metaInfo: Map<string, TypeMeta>,
    fetchFromExternalSource?: (type: string, uuid: string) => any,
    options: { freeze?: boolean } = { freeze: true }
): Store {
    const store = new EternalStore(metaInfo, fetchFromExternalSource);

    const publicAPI: Store = {
        createObject: (type) => store.createObject(type),
        produce: (recipe, obj) => store.produce(recipe as InternalRecipe, obj as InternalObjectProps) as any,
        getObject: (uuid) => store.getObject(uuid),
    };

    return options.freeze ? Object.freeze(publicAPI) : publicAPI;
}

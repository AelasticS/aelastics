import * as t from 'aelastics-types';

export const RequestResponseSchema = t.schema('RequestResposneSchema');

export const Operation = t.object(
  {
    operationType: t.number, // 0 - create, 2-update, 3-delete, 4-connect, 5-disconnect, 6-specialize, 7-generalize
    firstObjID: t.string,
    firstObjType: t.string
  },
  'Operation',
  RequestResponseSchema
);

const ObjectProps = t.object(
  {
    propNames: t.arrayOf(t.string),
    propValues: t.arrayOf(t.string)
  },
  'ObjectProps',
  RequestResponseSchema
);
export const Create = t.subtype(
  Operation,
  {
    props: ObjectProps
  },
  'Create',
  RequestResponseSchema
);

export const Update = t.subtype(
  Operation,
  {
    props: ObjectProps
  },
  'Update',
  RequestResponseSchema
);

export const Delete = t.subtype(Operation, {}, 'Delete', RequestResponseSchema);

export const Connect = t.subtype(Operation, {
    assocName:t.string,
    secondObjID:t.string
}, 'Connect', RequestResponseSchema);

export const Disconnect = t.subtype(Operation, {
    assocName:t.string,
    secondObjID:t.string
}, 'Disconnect', RequestResponseSchema);

export const Specialize = t.subtype(Operation, {
    toType:t.string,
    props: ObjectProps
}, 'Specialize', RequestResponseSchema);

export const Generalize = t.subtype(Operation, {
    fromType:t.string,
    toType:t.string,
}, 'Generalize', RequestResponseSchema);

export const ServerRequest = t.object(
  {
    schema: t.string,
    operations: t.arrayOf(Operation)
  },
  'ServerRequest',
  RequestResponseSchema
);



export const ServerQuery = t.object(
  {
    schema: t.string,
    query: t.string
  },
  'ServerQuery',
  RequestResponseSchema
);

export const RequestResposneType = t.object(
  {
    options: t.string,
    requests: t.arrayOf(ServerRequest),
    queries: t.arrayOf(ServerQuery)
  },
  'RequestResposneType',
  RequestResponseSchema
);

export type IRequestResponseType = t.TypeOf<typeof RequestResposneType>;
export type IServerQuery = t.TypeOf<typeof ServerQuery>;
export type IServerRequest = t.TypeOf<typeof ServerRequest>;
export type IGeneralize = t.TypeOf<typeof Generalize>;
export type ISpecialize = t.TypeOf<typeof Specialize>;
export type IDisconnect = t.TypeOf<typeof Disconnect>;
export type IConnect = t.TypeOf<typeof Connect>;
export type IDelete = t.TypeOf<typeof Delete>;
export type IUpdate = t.TypeOf<typeof Update>;
export type ICreate = t.TypeOf<typeof Create>;
export type IObjectProps = t.TypeOf<typeof ObjectProps>;
export type IOperation = t.TypeOf<typeof Operation>;


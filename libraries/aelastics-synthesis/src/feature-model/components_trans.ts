/** @jsx hm*/

// import { STX } from "../jsx/handle";

import * as g from "./TypesMetaModel/types-meta.model";
import * as t from "aelastics-types";

export function hm<P extends WithRefProps<g.IModelElement>>(
  t: Template<P>,
  props: P,
  ...children: Element<any>[]
): Element<P> {
  let childElem = t(props);
  childElem.children.push(...children.flat());
  return childElem;
}

export type RefProps = {
  $local_id?: string;
  $ref?: g.IModelElement;
  $ref_local_id?: string;
  $ref_id?: string;
};

export class Element<P extends WithRefProps<g.IModelElement>> {
  public children: Element<any>[] = [];
  public makeTrace: boolean = false;
  constructor(
    public readonly type: t.Any,
    public readonly props: P,
    public readonly parentProp?: string
  ) {}
}

export type WithRefProps<P> = RefProps & Partial<P>;

export type Template<P extends WithRefProps<g.IModelElement>> = (
  props: P
) => Element<P>;

export const Object: Template<WithRefProps<g.IObject>> = (props) => {
  return new Element(g.Object, props, undefined);
};

export const Property: Template<WithRefProps<g.IProperty>> = (props) => {
  return new Element(g.Property, props, "properties");
};

export const Subtype: Template<WithRefProps<g.ISubtype>> = (props) => {
  return new Element(g.Subtype, props, undefined);
};

export const TypeModel: Template<WithRefProps<g.ITypeModel>> = (props) => {
  return new Element(g.TypeModel, props, undefined);
};
// export type IModelElementProps = { name: string } & STX.InstanceProps;

// export const Object: STX.Template<IModelElementProps, g.IObject> = (
//   props,
//   store,
//   model
// ) => {
//   return STX.createChild(
//     g.Object,
//     props,
//     STX.createConnectFun({}, model),
//     store
//   );
// };

// export const Property: STX.Template<IModelElementProps, g.IProperty> = (
//   props,
//   store,
//   model
// ) => {
//   return STX.createChild(
//     g.Property,
//     props,
//     STX.createConnectFun({}, model),
//     store
//   );
// };

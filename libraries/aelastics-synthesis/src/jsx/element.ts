import * as t from "aelastics-types";
import { Any, ObjectLiteral } from "aelastics-types";
import * as g from "generic-metamodel";
import { Context } from "./context";
import { ModelStore } from "../index";
import { doParseURL, PathType } from "../model-store/path";

// export type RefProps = { $ref?:g.IModelElement} | {$refByID?:string} | {$refByName?:string}
export type RefProps = {
  $ref?: g.IModelElement;
  $refByID?: string;
  $refByName?: string;
};

export type ElementInstance<P extends g.IModelElement> = {
  type: t.ObjectType<any, any>;
  instance: P;
};

/*

URL schemas :  <protocol>:<namesepace>.<name>
examples          file://system/default/ 
                  file://system/aelastics-schema/   
                  repo://aelastics/feature-meta-model
                  repo://dejan/feature/model

export type WithRefProps<P> = RefProps | Partial<P>

<ImportNS ref="url" asName="">
  <ImportElement ref="url">
  <ImportModel ref="url">
</Import>

<Namespace/>

*/

export type WithRefProps<P> = RefProps & Partial<P>;
export type WithoutRefProps<P> = Exclude<P, RefProps>;
export type InstanceCreation<P extends WithRefProps<g.IModelElement>> = (
  props: P
) => ElementInstance<g.IModelElement>;

export type RenderPros = {
  children: ElementInstance<g.IModelElement>[];
  model: g.IModel;
  store: ModelStore;
};

// export type Template<P extends WithRefProps<g.IModelElement>,
//       R extends Partial<g.IModelElement> = P> = (props: P) => Element<R>

export type Template<P extends g.IModelElement> = (
  props: WithRefProps<P>
) => Element<WithRefProps<P>, P>;

export type CpxTemplate<P extends {}, R extends g.IModelElement> = (
  props: P
) => Element<P, R>;

export type ValueTemplate<P extends ObjectLiteral> = (
  props: WithRefProps<P>
) => Element<WithRefProps<P>, P>;

export type Super<P extends {}, R extends g.IModelElement> =
  | Template<R>
  | CpxTemplate<P, R>;

export type ConnectionInfo = {
  propName?: string; // the name property used to connect with, if it exist
  isParentProp: boolean; // is it a parent property
  isReconnectAllowed: boolean; // is connection allowed if object is already connected
  textContentAllowed: boolean; // are textual sub-elements allowed
  textPropName: string; // the name of property receiving text content, if the text content allowed
};
export function defaultConnectionInfo(propName?: string): ConnectionInfo {
  return {
    propName: propName,
    isParentProp: true,
    isReconnectAllowed: true,
    textContentAllowed: false,
    textPropName: "undefined",
  };
}

export class Element<P extends WithRefProps<g.IModelElement>, R = P> {
  public children: Element<any>[] = [];
  public isAbstract: boolean = false;
  public subElement?: Element<any>;
  public readonly connectionInfo?: ConnectionInfo;
  public props: P;

  constructor(
    public readonly type: t.ObjectType<any, any>,
    props: P,
    public readonly connInfo?: string | ConnectionInfo,
    public name?: string
  ) {
    if (typeof connInfo === "string")
      this.connectionInfo = defaultConnectionInfo(connInfo);
    else this.connectionInfo = connInfo;

    this.props = props ? props : ({} as P);
    this.name = name ? name : type.name;
  }

  private renderProps(props: P, ctx: Context, isImport: boolean): {} {
    let renderedProps = {};

    for (const [key, value] of Object.entries(props)) {
      let tmp =
        value instanceof Element<P> ? value.render(ctx, isImport) : value;
      Object.defineProperty(renderedProps, key, {
        value: tmp,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }

    return renderedProps;
  }

  // Find full path name
  public static getFullPathName(reference: string, ctx: Context): string {
    try {
      // split reference into segments
      const [urlType, urlSegments] = doParseURL(reference);
      // get namespaces on the stack
      let ctxArray = ctx.namespaceStack.elements;
      //
      if (urlType === PathType.ABS_PROTOCOL) {
        urlSegments.shift;
        return `/${urlSegments.join("/")}`;
      }
      if (urlType === PathType.ABS_NO_PROTOCOL) {
        return `${urlSegments.join("/")}`;
      }
      // remove slash or point
      if (urlType === PathType.REL_SLASH || urlType === PathType.REL_POINT) {
        urlSegments.shift;
      }
      let ctxArrayIndex = ctxArray.length - 1;
      let urlSegmentIndex = 0;

      while (ctxArrayIndex >= 0 && urlSegmentIndex <= urlSegments.length - 1) {
        // move up namespace if path segment is '..'
        if (urlSegments[urlSegmentIndex] != "..") {
          // construct absolute path and return
          const fname = ctx.store.getNameWithPath(ctxArray[ctxArrayIndex]);
          return `${fname}/${urlSegments.join("/")}`;
        }
        // continue iteration
        urlSegments.shift();
        ctxArrayIndex--;
        // urlSegmentIndex++;
      }

      return ""; // empty url
    } catch (e) {
      return ""; // empty url
    }
  }

  public create(
    ctx: Context,
    forImport: boolean
  ): ElementInstance<g.IModelElement> {
    let el: g.IModelElement | undefined;
    const { store, currentModel: model, currentNamespace: namespace } = ctx;

    // handle abstract element (ignore $id and $ref  props)
    if (this.isAbstract) {
      if (!this.subElement)
        throw new Error("elements is abstract but has no subElement!");
      // copy props from abstract element
      this.subElement.props = { ...this.props, ...this.subElement.props };
      // create subelement
      const sub = this.subElement.create(ctx, forImport);
      // take children from spec
      this.children.push(...this.subElement.children);
      return sub;
    }

    if (forImport && this.props.id) {
      // TODO: handle import of the element
    }
    // handle normal element
    if (this.props.$ref) {
      // is object reference to an existing element
      el = this.props.$ref;

      if (Object.keys(this.props).length > 1) {
        throw new Error(
          `Element '${this.type.fullPathName}' has $ref property - cannot have additional properties!`
        );
      }

      return { type: this.type, instance: el };
    } else if (this.props?.$refByID) {
      el = store.getByID(this.props.$refByID);
      if (!el)
        throw new ReferenceError(
          `Not existing object referenced with id=${this.props.$refByID} by element '${this.type.fullPathName}'`
        );

      if (Object.keys(this.props).length > 1) {
        throw new Error(
          `Element '${this.type.fullPathName}' has $refByID property - cannot have additional properties!`
        );
      }

      return { type: this.type, instance: el };
    } else if (this.props?.$refByName) {
      // is reference to an existing element by name
      const fullPathName = Element.getFullPathName(this.props.$refByName, ctx); // `${this.props.$refByName}`;
      el = store.getByName(fullPathName);
      if (!el)
        throw new ReferenceError(
          `Not existing object referenced with name "${this.props.$refByName}" by element '${this.type.fullPathName}'`
        );

      if (Object.keys(this.props).length > 1) {
        throw new Error(
          `Element '${this.type.fullPathName}' has $refByName property - cannot have additional properties!`
        );
      }

      return { type: this.type, instance: el };
    } else {
      let renderedProps = this.renderProps(this.props, ctx, forImport);

      // create element
      if (this.type.isOfType(g.Model))
        el = store.newModel(
          this.type,
          // renderedProps as unknown as g.IModel,
          { name: this.props.name } as unknown as g.IModel,
          model,
          namespace
        );
      else if (this.type.isOfType(g.Namespace))
        el = store.newNamespace(
          this.type,
          // renderedProps as unknown as g.INamespace,
          { name: this.props.name } as unknown as g.INamespace,
          model,
          namespace
        );
      else if (!model || !namespace)
        // model element must be in a model
        throw new Error(
          "No model in the context, but an element must be in a model!"
        );
      else {
        el = store.newModelElement(
          model,
          namespace,
          this.type,
          { name: this.props.name } as g.IModelElement // renderedProps as g.IModelElement
        );
      }

      for (const [key, value] of Object.entries(renderedProps)) {
        if (key !== "name") {
          //@ts-ignore
          el[key] = value;
        }
      }

      return { type: this.type, instance: el };
    }
  }

  // produce/create elements
  // TODO: first render (create) all children and merge with props and then create
  // because props objects are created empty in transducer
  // OR change the transducer to avoid creation of empty objects
  // example PesonNAme and string in ModelStore.test.ts

  public render<P extends g.IModelElement>(
    ctx: Context,
    isImport: boolean = false
  ): P {
    if ("store" in this.props) {
      ctx.pushStore((<any>this.props).store);
    }
    const parent = this.create(ctx, isImport);
    // if (parent.type.isOfType(g.Namespace)) { // push model to context
    //   ctx.pushModel(<g.INamespace>parent.instance)
    // }
    if (parent.type.isOfType(g.Model)) {
      // push model to context
      ctx.pushModel(<g.IModel>parent.instance);
    }
    let objType = parent.type as t.ObjectType<any, any>;
    let mapPropTypes = objType.allProperties;
    this.children.forEach((childElement) => {
      if (childElement === null) return; // null prevents rendering https://legacy.reactjs.org/docs/conditional-rendering.html#preventing-component-from-rendering
      if (!childElement) {
        throw new Error(
          `childElement undefined for parent "${this.props.name}" of type "${this.type.fullPathName}"`
        );
      }
      // check textual child
      if (typeof childElement === "string") {
        const txtProp = this.connectionInfo?.textPropName;
        if (
          this.connectionInfo?.textContentAllowed &&
          txtProp &&
          txtProp &&
          txtProp in parent.instance
        ) {
          //@ts-ignore
          parent.instance[txtProp] = childElement;
        } else
          throw new Error(
            `Not allowed text "${childElement}" in content of element "${this.name}"`
          );
      } else {
        // process proper children element
        const child = childElement.render(ctx, isImport);
        if (childElement.connectionInfo) {
          // connect parent and child if propName exit
          let propType = mapPropTypes.get(
            childElement.connectionInfo.propName!
          );
          if (propType)
            cnParentChild(
              childElement.connectionInfo.propName,
              t.findTypeCategory(propType),
              parent.instance,
              child,
              childElement.connectionInfo.isReconnectAllowed
            );
        }
      }
    });
    if (parent.type.isOfType(g.Model)) {
      // return old model
      ctx.popModel();
    }
    if ("store" in this.props) {
      ctx.popStore();
    }
    return parent.instance as P;
  }
}

// TODO: implement check reconnect allowed
// TODO: test reconnect allowed
let cnParentChild = (
  prop: string | undefined,
  propType: t.TypeCategory | undefined,
  obj1: any,
  obj2: any,
  isReconnectAllowed: boolean
) => {
  if (prop) {
    if (obj1 === obj2) {
      throw new Error(
        `cnParentChild: connection not allowed between the same objects "${obj1.name}" via property "${prop}"`
      );
    }

    switch (propType) {
      case "Object":
        if (!isReconnectAllowed && obj1[prop])
          throw new Error(
            `cnParentChild: reconnection not allowed between "${obj1.name}" and "${obj2.name}" via property "${prop}"`
          );
        obj1[prop] = obj2;

        break;
      case "Array":
        if (obj1[prop] === undefined) obj1[prop] = new Array();

        if ((obj1[prop] as Array<any>).findIndex((e) => e === obj2) === -1)
          (obj1[prop] as Array<any>).push(obj2);
        break;
    }
  }
};

// const cnParentChild = (parent: g.IModelElement, child: g.IModelElement, propName:string) => {
//     if (!child)
//       return
//     if (!parent)
//       return
//     // local function to connect parent and child

//     cn(a.parentPropName, a.parentPropType, parent, child)
//     cn(a.childPropName, a.childPropType, child, parent)
//   }

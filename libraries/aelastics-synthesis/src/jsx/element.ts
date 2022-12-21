import * as t from "aelastics-types";
import { Any } from "aelastics-types";
import * as g from "generic-metamodel";
import { Context } from "./context";
import { ModelStore } from "./ModelsStore";
import { doParseURL, PathType } from "./path";


// export type RefProps = { $ref?:g.IModelElement} | {$refByID?:string} | {$refByName?:string}
export type RefProps = {
  $ref?: g.IModelElement;
  $refByID?: string;
  $refByName?: string;
};

export type ElementInstance<P extends g.IModelElement> = {
  type: t.Any;
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

export type Super<P extends {}, R extends g.IModelElement> =
  | Template<R>
  | CpxTemplate<P, R>;

export class Element<P extends WithRefProps<g.IModelElement>, R = P> {
  public children: Element<any>[] = [];
  public isAbstract: boolean = false;
  public subElement?: Element<any>;
  constructor(
    public readonly type: t.Any,
    public props: P,
    //TODO: introduce type (Child|Parent, propName) and utility function
    // to forbid reconnections
    public readonly parentProp?: string
  ) {}

  private setProps(
    el: ElementInstance<g.IModelElement>,
    props: P
  ): ElementInstance<g.IModelElement> {
    const typeProps = (el.instance as any as t.ObjectType<any, any>)
      .allProperties;
    // TODO
    return el;
  }

  // TODO: find full path name
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

      while (ctxArrayIndex >= 0 && urlSegmentIndex <= urlSegments.length-1) {
        // move up namespace if path segment is '..'
        if (urlSegments[urlSegmentIndex] != "..") {
          // construct absolute path and return
          const fname = ctx.store.getNameWithPath(ctxArray[ctxArrayIndex])
          return `${fname}/${urlSegments.join("/")}`;
        }
        // continue iteration
        urlSegments.shift()
        ctxArrayIndex--;
        // urlSegmentIndex++;
      }

      return ""; // empty url
    } catch (e) {
      return ""; // empty url
    }
  }

  public create(ctx: Context): ElementInstance<g.IModelElement> {
    let el: g.IModelElement | undefined;
    const { store, currentModel: model, currentNamespace: namespace } = ctx;

    // handle abstract element (ignore $ref and $ref_id props)
    if (this.isAbstract) {
      if (!this.subElement)
        throw new Error("elements is abstract but has no subElement!");
      // copy props from abstract element
      this.subElement.props = { ...this.props, ...this.subElement.props };
      // create subelement
      const sub = this.subElement.create(ctx);
      // take children from spec
      this.children.push(...this.subElement.children);
      return sub;
    }

    // handle normal element
    if (this.props.$ref) {
      // is object reference to an existing element
      el = this.props.$ref;
      return this.setProps({ type: this.type, instance: el }, this.props);
    } else if (this.props?.$refByID) {
      el = store.getByID(this.props.$refByID);
      if (!el)
        throw new ReferenceError(
          `Not existing object referenced with id=${this.props.$refByID} by element '${this.type.fullPathName}'`
        );
      return this.setProps({ type: this.type, instance: el }, this.props);
    } else if (this.props?.$refByName) {
      // is reference to an existing element by name
      const fullPathName =  Element.getFullPathName(this.props.$refByName, ctx) // `${this.props.$refByName}`;
      el = store.getByName(fullPathName);
      if (!el)
        throw new ReferenceError(
          `Not existing object referenced with name "${this.props.$refByName}" by element '${this.type.fullPathName}'`
        );
      return this.setProps({ type: this.type, instance: el }, this.props);
    } else {
      // create element with a full qualified name
      // const fullPathName =  Element.getFullPathName(this.props.name!, ctx)
      // if(!this.props.label) {
      //   this.props.label = this.props.name
      // }
      // this.props.name = fullPathName
      // this.props.path = namespace?.name

      if (this.type.isOfType(g.Model))
        el = store.newModel(
          this.type,
          this.props as unknown as g.IModel,
          model,
          namespace
        );
      else if (this.type.isOfType(g.Namespace))
        el = store.newNamespace(
          this.type,
          this.props as unknown as g.INamespace,
          model,
          namespace
        );
      else if (!model || !namespace)
        // model element must be in a model
        throw new Error(
          "No model in the context, but an element must be in a model!"
        );
      else
        el = store.newModelElement(
          model,
          namespace,
          this.type,
          this.props as g.IModelElement
        );
      return { type: this.type, instance: el };
    }
  }

  // produce/create elements
  public render<P extends g.IModelElement>(ctx: Context): P {
    if ("store" in this.props) {
      ctx.pushStore((<any>this.props).store);
    }
    const parent = this.create(ctx);
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
      const child = childElement.render(ctx);
      if (childElement.parentProp) {
        // connect parent and child
        let propType = mapPropTypes.get(childElement.parentProp);
        if (!propType) throw new Error();
        cnParentChild(
          childElement.parentProp,
          t.findTypeCategory(propType),
          parent.instance,
          child
        );
        // toDO: create trace!
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

let cnParentChild = (
  prop: string | undefined,
  propType: t.TypeCategory | undefined,
  obj1: any,
  obj2: any
) => {
  if (prop) {
    switch (propType) {
      case "Object":
        obj1[prop] = obj2;
        break;
      case "Array":
        if (obj1[prop] === undefined) obj1[prop] = new Array();
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

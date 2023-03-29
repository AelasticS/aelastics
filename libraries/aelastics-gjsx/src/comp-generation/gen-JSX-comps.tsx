/** @jsx hm */
import {
  ConnectionInfo,
  defaultConnectionInfo,
  hm,
  Template,
  ModelStore,
  Context,
  Element,
  JSX_Export as jsx,
} from "aelastics-synthesis";
import {
  generate,
  M2T,
  getResultByItemPath,
  M2T_Model,
  IParagraph,
  ISection,
  Doc,
  P,
  Sec,
} from "aelastics-m2t";

import { generate_JSX_Elements } from "../index";
import { ObjectType } from "aelastics-types";

interface PrintingContext {
  path: string;
  varName: string;
  printedComps: Map<string, jsx.JSX_Element>;
}
export type Options = {
  pathToTypesDefModule: string;
  typesDefVarName: string;
  outPutFile: string;
  rootDir: string,
  mode: "real" | "mock"
};

export async function genJSXComponents<T extends ObjectType<any, any>>(
  ta: jsx.Typed_JSX_Annotation<T>,
  opt: Options
) {
  const testStore = new ModelStore();
  const orgElem = generate_JSX_Elements(ta);
  const j2t = jsx2TextModel(orgElem, opt, testStore);
  const testDoc1: M2T_Model = j2t.render(new Context());
  const res = await generate(testStore, testDoc1, {
    rootDir: opt.rootDir,
    mode: opt.mode,
  });
  return res;
}

export function jsx2TextModel(
  topElement: jsx.Complex_JSX_Element,
  options: Options,
  store: ModelStore
): Element<M2T_Model> {
  // create context
  const ctx: PrintingContext = {
    path: options.pathToTypesDefModule,
    varName: options.typesDefVarName,
    printedComps: new Map(),
  };
  // return Text Model
  return (
    <M2T name="test model3" store={store}>
      <Doc name={options.outPutFile}>
        {printTopJSX_Element(topElement, ctx)}
        {printJSX_Element(topElement, ctx, false)}
      </Doc>
    </M2T>
  );
}

function printJSX_Element(
  el: jsx.Complex_JSX_Element | jsx.Reference_JSX_Element,
  ctx: PrintingContext,
  printComp: boolean = true
): Template<ISection> {
  return (
    <Sec>
      {printComp ? printJSXComp(el, ctx) : null}
      {el instanceof jsx.Complex_JSX_Element ? (
        el.references
          .filter((r) => !ctx.printedComps.has(r.tagName))
          .map((r) => printJSXComp(r, ctx))
      ) : (
        <P />
      )}
      {el instanceof jsx.Complex_JSX_Element ? (
        el.subElements
          .filter((r) => !ctx.printedComps.has(r.tagName))
          .map((r) => printJSX_Element(r, ctx, true))
      ) : (
        <P />
      )}
    </Sec>
  );
}

function printJSXComp(
  el: jsx.Complex_JSX_Element | jsx.Reference_JSX_Element,
  ctx: PrintingContext
): Template<IParagraph> {
  // prepare props for printing
  let ci = {} as ConnectionInfo;
  let an = el.annotation;
  if (an?.ifProperty) {
    let prop = an.ifProperty;
    if (prop.propName !== undefined)
      Object.defineProperty(ci, "propName", { value: prop.propName, enumerable:true });
    if (prop.isParentProp)
      Object.defineProperty(ci, "isParentProp", { value: prop.isParentProp, enumerable:true});
    if (prop.isReconnectAllowed !== undefined)
      Object.defineProperty(ci, "isReconnectAllowed", {
        value: prop.isReconnectAllowed,
        enumerable:true
      });
    if (prop.textContentAllowed !== undefined) {
      Object.defineProperty(ci, "textContentAllowed", {
        value: prop.textContentAllowed,
        enumerable:true
      });
      if (prop.textPropName !== undefined && prop.textContentAllowed)
        Object.defineProperty(ci, "textPropName", { 
          value: prop.textPropName,
          enumerable:true
        });
      else if(!prop.textPropName && prop.textContentAllowed)
        throw new Error(
          `Missing "textPropName" annotation for  for element "${el.tagName}"`
        );
    }
  }

  // make final printing props
  let defProps = defaultConnectionInfo()
  let ciFinal: ConnectionInfo = { ...defProps, ...ci };

  // add JSX comp to printed ones
  ctx.printedComps.set(el.tagName, el);

  // return JSX com declaration
  return (
    <P>
      {`
export const ${el.tagName}: Template<${ctx.varName}.I${el.typeName}> = (props) => {
  return new Element(${ctx.varName}.I${el.typeName}, props, {
    propName:"${ciFinal.propName}",
    isParentProp: ${ciFinal.isParentProp},
    isReconnectAllowed:${ciFinal.isReconnectAllowed},
    textContentAllowed:${ciFinal.textContentAllowed},
    textPropName:"${ciFinal.textPropName}" })
}`}
    </P>
  );
}

function printTopJSX_Element(
  el: jsx.Complex_JSX_Element,
  ctx: PrintingContext
) {
  return (
    <P>
      {`import * as ${ctx.varName} from "${ctx.path}"
import { ConnectionInfo, CpxTemplate, Element, Template, WithRefProps, ModelStore } from 'aelastics-synthesis'

export type I${el.typeName}_Props = WithRefProps<${ctx.varName}.${el.typeName}> & { store?: ModelStore }

export const ${el.tagName}: CpxTemplate<I${el.typeName}_Props, ${ctx.varName}.${el.typeName}> = (props) => {
     return new Element(${ctx.varName}.${el.typeName}, props, undefined)
}
`}
    </P>
  );
}

import {
  IFS_Model,
  IDocument,
  IDocElement,
  ISection,
  IParagraph,
  IDirectory,
  isDirectory,
  isParagraph,
} from "../index";
import { RenderContext } from "./renderContext";
import { ExecResult, ItemResult } from "./execResult";
import { success } from "aelastics-result";


/**
 * 
 * @param m file system model
 * @param acting if true executes with an effect on real file system; otherwiese returens results without an effect on real file system
 * @param rootDir 
 * @returns 
 */
export const executeFS_Model = (m: IFS_Model, acting:boolean = false, rootDir:string="output"): ExecResult => {
  const ctx = new RenderContext(acting, rootDir)
  m.elements.forEach((i) =>
    isDirectory(i) ? executeDirectory(i, ctx) : executeDocument(<IDocument>i, ctx)
  );
  return ctx.result;
};

const executeDirectory = (d: IDirectory, ctx: RenderContext) => {
  d.items.forEach((s) => executeFileElement(s));
};

const executeDocument = (d: IDocument, ctx: RenderContext) => {
  try {
    let buffer: Array<string> = [];
    d.elements.forEach((s) => buffer.push(executeFileElement(s)));
    const text = buffer.join("");
    const res:ItemResult = {
      itemID: d.id,
      itemPath:d.name,
      itemType:"Doc",
      outcome:success(text)
    }
    ctx.result.results.push(res)
    ctx.result.noSuccesses++;
  } catch (e) {}
};

/**
 * 
 * @param input 
 * @returns 
 */
const executeFileElement = (input: IDocElement): string =>
  isParagraph(input) ? `${input.txtContent}\n` : executeSection(<ISection>input);

const executeSection = (input: ISection): string => {
  let buffer: Array<string> = [];
  input.elements.forEach((s) => buffer.push(executeFileElement(s)));
  return buffer.join("");
};

export const getResultByItemID = (res:ExecResult, id:string) => {
  const r = res.results.find(item => item.itemID===id)
  return r? r.outcome:undefined
}

export const getResultByItemPath = (res:ExecResult, path:string) => {
  const r = res.results.find(item => item.itemPath===path)
   return r? r.outcome:undefined
}

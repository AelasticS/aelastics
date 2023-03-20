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

const executeFileElement = (input: IDocElement): string =>
  isParagraph(input) ? `${input.txtContent}\n` : executeSection(<ISection>input);

const executeSection = (input: ISection): string => {
  let buffer: Array<string> = [];
  input.elements.forEach((s) => buffer.push(executeFileElement(s)));
  return buffer.join("");
};

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
import { RenderResult } from "./resultHandler";


export const renderFS_Model = (m: IFS_Model, acting:boolean = false, rootDir?:string ): RenderResult => {
  const ctx = new RenderContext(acting, rootDir)
  m.elements.forEach((i) =>
    isDirectory(i) ? renderDirectory(i, ctx) : renderDocument(<IDocument>i, ctx)
  );
  return ctx.result;
};

const renderDirectory = (d: IDirectory, ctx: RenderContext) => {
  d.items.forEach((s) => renderFileElement(s));
};

const renderDocument = (d: IDocument, ctx: RenderContext) => {
  try {
    let buffer: Array<string> = [];
    d.elements.forEach((s) => buffer.push(renderFileElement(s)));
    const text = buffer.join("");
    ctx;
    ctx.result.noSuccesses++;
  } catch (e) {}
};

const renderFileElement = (input: IDocElement): string =>
  isParagraph(input) ? `${input.txtContent}\n` : renderSection(<ISection>input);

const renderSection = (input: ISection): string => {
  let buffer: Array<string> = [];
  input.elements.forEach((s) => buffer.push(renderFileElement(s)));
  return buffer.join("");
};

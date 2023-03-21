import {
  IFS_Model,
  IDocument,
  IDocElement,
  ISection,
  IDirectory,
  isDirectory,
  isParagraph,
  IFS_Item,
  FS_Item,
} from "../index";
import { GenContext } from "./gen-context";
import { GenResult, ItemResult } from "./gen-result";
import { failure, success } from "aelastics-result";
import { createDir, createFile } from "./fs-operations"
import { ModelStore } from "aelastics-synthesis";

export type Options = {
  rootDir?:string,
  mode?:"real" | "mock"
}

/**
 *  Generate directories and files specified by a file system model 
 * @param m - file system model
 * @param acting - if true, generate with an effect on real file system; otherwise do nothing 
 * @param rootDir - the start of directory hierarchy 
 * @returns - results of execution; returned even if acting param is false
 */
export const generate = async (store:ModelStore, m: IFS_Model, options?: Options): Promise<GenResult> => {
  const acting: boolean = false, rootDir: string = "output"
  const ctx = new GenContext(store, {rootDir:"output", mode:"mock", ...options} )
  m.elements.forEach(async (item) => {
    if (store.isTypeOf(item, FS_Item))
       await generateItem(item, ctx)
  });
  return ctx.result;
};

const generateItem = async (i: IFS_Item, ctx: GenContext) => 
    isDirectory(i) 
    ? generateDirectory(i, ctx) 
    : generateDocument(<IDocument>i, ctx)

const generateDirectory = async (dir: IDirectory, ctx: GenContext) => {
  try {
    if (ctx.acting)
      await createDir(dir.name)
    const res: ItemResult = {
      itemID: dir.id,
      itemPath: dir.name,
      itemType: "Dir",
      outcome: success("successfully created")
    }
    ctx.result.results.push(res)
    ctx.result.noSuccesses++;
  }
  catch (e) {
    const res: ItemResult = {
      itemID: dir.id,
      itemPath: dir.name,
      itemType: "Dir",
      outcome: failure(e as Error)
    }
    ctx.result.results.push(res)
    ctx.result.noFailures++;
    return
  }
  // execute files in the directory
  dir.items.forEach(async (item) => await generateItem(item, ctx));

};

/**
 * 
 * @param doc - document to be created
 * @param ctx - execution context
 */
const generateDocument = async (doc: IDocument, ctx: GenContext) => {
  try {
    let buffer: Array<string> = [];
    doc.elements.forEach((s) => buffer.push(generateFileElement(s)));
    const text = buffer.join("");
    if (ctx.acting)
      await createFile(doc.name, text)

    const res: ItemResult = {
      itemID: doc.id,
      itemPath: doc.name,
      itemType: "Doc",
      outcome: success(text)
    }
    ctx.result.results.push(res)
    ctx.result.noSuccesses++;
  } catch (e) {
    const res: ItemResult = {
      itemID: doc.id,
      itemPath: doc.name,
      itemType: "Doc",
      outcome: failure(e as Error)
    }
    ctx.result.results.push(res)
    ctx.result.noFailures++;
  }
};

/**
 * 
 * @param input 
 * @returns 
 */
const generateFileElement = (input: IDocElement): string =>
  isParagraph(input) ? `${input.txtContent}\n` : generateSection(<ISection>input);

const generateSection = (input: ISection): string => {
  let buffer: Array<string> = [];
  input.elements.forEach((s) => buffer.push(generateFileElement(s)));
  return buffer.join("");
};

/**
 * Get a result about a specific directory or file 
 * @param res - result about execeuting 
 * @param id 
 * @returns 
 */
export const getResultByItemID = (res: GenResult, id: string) => {
  const r = res.results.find(item => item.itemID === id)
  return r ? r.outcome : undefined
}

export const getResultByItemPath = (res: GenResult, path: string) => {
  const r = res.results.find(item => item.itemPath === path)
  return r ? r.outcome : undefined
}

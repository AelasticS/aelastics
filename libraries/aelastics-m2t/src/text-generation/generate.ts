import {
  M2T_Model,
  IDocument,
  IDocElement,
  ISection,
  IDirectory,
  isDirectory,
  isParagraph,
  IM2T_Item,
  M2T_Item,
} from "../index";
import { GenContext } from "./gen-context";
import { GenResult, ItemResult } from "./gen-result";
import { failure, success } from "aelastics-result";
import { createDir, createFile } from "./fs-operations"
import { ModelStore } from "aelastics-synthesis";


/**
 *  Options for generating text
 */
export type Options = {
  rootDir?: string,
  mode?: "real" | "mock"
}


/**
 * Generate text files specified by a M2T model
 * @param store 
 * @param m  - model specifying text genaration 
 * @param options - generation options
 * @returns 
 */
export const generate = async (store: ModelStore, m: M2T_Model, options?: Options): Promise<GenResult> => {
  const acting: boolean = false, rootDir: string = "output"
  const ctx = new GenContext(store, options)
  try {
    if (ctx.realMode)
      // create top dir
      createDir(ctx.rootDir)
  } catch (e) {
    const res: ItemResult = {
      itemID: "-1",
      itemPath: ctx.rootDir,
      itemType: "Dir",
      outcome: failure(e as Error)
    }
    ctx.result.results.push(res)
    ctx.result.noFailures++;
    return ctx.result
  }

  // generate model elements
  m.elements.forEach(async (item) => {
    if (store.isTypeOf(item, M2T_Item))
      await generateItem(item, ctx.rootDir, ctx)
  });
  return ctx.result;
};


/**
 *  Generate directories and files specified by a file system model 
 * 
 * @param acting - if true, generate with an effect on real file system; otherwise do nothing 
 * @param rootDir - the start of directory hierarchy 
 * @returns - results of execution; returned even if acting param is false
 */

/**
 * 
 * @param i 
 * @param path 
 * @param ctx 
 * @returns 
 */
const generateItem = async (i: IM2T_Item, path: string, ctx: GenContext) =>
  isDirectory(i)
    ? generateDirectory(i, path, ctx)
    : generateDocument(<IDocument>i, path, ctx)

const generateDirectory = async (dir: IDirectory, path: string, ctx: GenContext) => {
  try {
    if (ctx.realMode)
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
    return // stop generation further for this dir
  }
  const currPath = `${path}/${dir.name}`
  // execute files in the directory
  dir.items.forEach(async (item) => await generateItem(item, currPath, ctx));

};

/**
 * 
 * @param doc 
 * @param path 
 * @param ctx 
 */
const generateDocument = async (doc: IDocument, path: string, ctx: GenContext) => {
  try {
    let buffer: Array<string> = [];
    doc.elements.forEach((s) => buffer.push(generateFileElement(s)));
    const text = buffer.join("");
    const currPath = `${path}/${doc.name}`
    if (ctx.realMode)
      await createFile(currPath, text)

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

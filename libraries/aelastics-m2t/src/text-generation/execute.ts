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
import { ExecContext } from "./execContext";
import { ExecResult, ItemResult } from "./execResult";
import { failure, success } from "aelastics-result";
import { createDir, createFile } from "./fs-operations"
import { ModelStore } from "aelastics-synthesis";

/**
 *  Create directories and files specified by a file system model 
 * @param m - file system model
 * @param acting - if true, executes with an effect on real file system; otherwise do nothing 
 * @param rootDir - the start of directory hierarchy 
 * @returns - results of execution; returned even if acting param is false
 */
export const executeFS_Model = async (store:ModelStore, m: IFS_Model, acting: boolean = false, rootDir: string = "output"): Promise<ExecResult> => {
  const ctx = new ExecContext(store, acting, rootDir)
  m.elements.forEach(async (item) => {
    if (store.isTypeOf(item, FS_Item))
       await executeItem(item, ctx)
  });
  return ctx.result;
};

const executeItem = async (i: IFS_Item, ctx: ExecContext) => 
    isDirectory(i) 
    ? executeDirectory(i, ctx) 
    : executeDocument(<IDocument>i, ctx)

const executeDirectory = async (dir: IDirectory, ctx: ExecContext) => {
  try {
    if (ctx.acting)
      await createDir(dir.name)
    const res: ItemResult = {
      itemID: dir.id,
      itemPath: dir.name,
      itemType: "Dir",
      outcome: success("created")
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
  dir.items.forEach(async (item) => await executeItem(item, ctx));

};

/**
 * 
 * @param doc - document to be created
 * @param ctx - 
 */
const executeDocument = async (doc: IDocument, ctx: ExecContext) => {
  try {
    let buffer: Array<string> = [];
    doc.elements.forEach((s) => buffer.push(executeFileElement(s)));
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
const executeFileElement = (input: IDocElement): string =>
  isParagraph(input) ? `${input.txtContent}\n` : executeSection(<ISection>input);

const executeSection = (input: ISection): string => {
  let buffer: Array<string> = [];
  input.elements.forEach((s) => buffer.push(executeFileElement(s)));
  return buffer.join("");
};

export const getResultByItemID = (res: ExecResult, id: string) => {
  const r = res.results.find(item => item.itemID === id)
  return r ? r.outcome : undefined
}

export const getResultByItemPath = (res: ExecResult, path: string) => {
  const r = res.results.find(item => item.itemPath === path)
  return r ? r.outcome : undefined
}

import { RenderResult } from "./resultHandler";

export class RenderContext {
    rootDir?: string; // defualt is the current directory
    acting:boolean  // deafult is not to act (generate dirs and docs) 
    result: RenderResult;

    constructor(acting:boolean = false, rootDir?:string) {
       this.acting = acting
       this.rootDir = rootDir 
       this.result = {
        noFailures:0,
        noSuccesses:0,
        message:"",
        results:[]
       }
    }
  };
  
  
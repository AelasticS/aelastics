import { ModelStore } from "aelastics-synthesis";
import { GenResult } from "./gen-result";
import { Options } from "./generate";

export class GenContext {
    rootDir?: string; // defualt is the current directory
    acting:boolean  // deafult is not to act (generate dirs and docs) 
    result: GenResult;

    constructor(readonly store:ModelStore, options:Options) {
       this.acting = options.mode === "real" ? true : false
       this.rootDir = options.rootDir 
       this.result = {
        noFailures:0,
        noSuccesses:0,
        message:"",
        results:[]
       }
    }
  };
  
  
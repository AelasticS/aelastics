import { ModelStore } from "aelastics-synthesis";
import { ExecResult } from "./execResult";

export class ExecContext {
    rootDir?: string; // defualt is the current directory
    acting:boolean  // deafult is not to act (generate dirs and docs) 
    result: ExecResult;

    constructor(readonly store:ModelStore,acting:boolean = false, rootDir?:string) {
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
  
  
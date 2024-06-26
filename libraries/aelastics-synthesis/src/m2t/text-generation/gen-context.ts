import { ModelStore } from "./../../index";
import { GenResult } from "./gen-result";
import { Options } from "./generate";

export class GenContext {
  rootDir: string; // defualt is the current directory
  realMode: boolean; // deafult is not to act (generate dirs and docs)
  indent: boolean;
  result: GenResult;

  constructor(readonly store: ModelStore, options?: Options) {
    options = { rootDir: "output", mode: "mock", indent: true, ...options };
    this.realMode = options.mode === "real" ? true : false;
    this.indent = options.indent ? true : false;
    this.rootDir = options.rootDir!;
    this.result = {
      noFailures: 0,
      noSuccesses: 0,
      message: "",
      results: [],
    };
  }
}

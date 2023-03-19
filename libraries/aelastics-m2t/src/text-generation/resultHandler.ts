import { failure, Result, success } from "aelastics-result";

export type ItemResult = {
  itemID: string;
  itemType: "Doc" | "Dir";
  itemPath: string;
  outcome: Result<string>;
};

export type RenderResult = {
  noFailures: number;
  noSuccesses: number;
  results: ItemResult[];
  message: string;
};

export const addSuccess = (
    r: RenderResult,
    ID: string,
    type: "Doc" | "Dir",
    path: string,
    value: string
  ) => {
    r.noSuccesses++;
    r.results.push({
      itemID: ID,
      itemPath: path,
      itemType: type,
      outcome: success(value),
    });
  };
  
  export const addFailure = (
    r: RenderResult,
    ID: string,
    type: "Doc" | "Dir",
    path: string,
    error: Error
  ) => {
    r.noSuccesses++;
    r.results.push({
      itemID: ID,
      itemPath: path,
      itemType: type,
      outcome: failure(error),
    });
  };
  
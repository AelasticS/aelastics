/*
 * Project: aelastics-store
 * Created Date: Thursday November 3rd 2022
 * Author: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Last Modified: Saturday, 16th September 2023
 * Modified By: Sinisa Neskovic (https://github.com/Sinisa-Neskovic)
 * -----
 * Copyright (c) 2023 Aelastics (https://github.com/AelasticS)
 */


import {
  ServiceError,
  isFailure,
  isSuccess,
  ServiceResult,
  success,
} from 'aelastics-result';

export interface ServerCommand<CmdType> {
  command: CmdType;
}
export interface ServerQuery<QueryType> {
  query: QueryType;
}

export interface IRequestType<CmdType, QueryType> {
  options: string;
  queries: Array<ServerQuery<QueryType>>;
  commands: Array<ServerCommand<CmdType>>;
}

export class ServerRequest<CmdType, QueryType> {
  public readonly request: IRequestType<CmdType, QueryType>;
  public isValid(): ServiceResult<boolean> {
    return success(true);
  }

  public constructor(
    options: string = '',
    queries?: Array<ServerQuery<QueryType>>,
    cmds?: Array<ServerCommand<CmdType>>
  ) {
    this.request = {
      options: options,
      queries: queries ? queries : [],
      commands: cmds ? cmds : [],
    };
  }

  public addCommand(cmd: ServerCommand<CmdType>): this {
    if (!this.request.commands) {
      this.request.commands = new Array<ServerCommand<CmdType>>();
    }
    this.request.commands.push(cmd);
    return this;
  }
  public addQuery(q: ServerQuery<QueryType>): this {
    if (!this.request.queries) {
      this.request.queries = new Array<ServerQuery<QueryType>>();
    }
    this.request.queries.push(q);
    return this;
  }
}

export class ServerResponse<QueryResponseType> {
  public cmdResponse: Array<ServiceResult<boolean>> = [];
  public queryResponse: Array<ServiceResult<QueryResponseType>> = [];

  public isSuccess: boolean = false;

  constructor() {}
  public get errors(): ServiceError[] {
    let errs: ServiceError[] = [];
    this.cmdResponse.forEach((e) => {
      if (isFailure(e)) {
        errs.push(...e.errors);
      }
    });
    this.queryResponse.forEach((e) => {
      if (isFailure(e)) {
        errs.push(...e.errors);
      }
    });
    return errs;
  }

  public get value(): QueryResponseType[] {
    let res: QueryResponseType[] = [];
    this.queryResponse.forEach((e) => {
      if (isSuccess(e)) {
        res.push(e.value);
      }
    });
    return res;
  }
}

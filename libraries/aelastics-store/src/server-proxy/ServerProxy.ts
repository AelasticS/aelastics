/*
 * Copyright (c) 2020 AelasticS
 * Author: Sinisa Neskovic
 */

import { ConnectionOptions } from './ConnectionOptions';
import { ServerCommand, ServerRequest, ServerResponse } from './ServerRequestResponse';
import { ServiceError } from '../../../aelastics-result';
import { Command, CommandMaker } from './CommandMaker';
import { TypeSchema } from 'aelastics-types';

/**
 * ServerProxy is an abstract class which represent a proxy to a specific api server.
 * You can have multiple serverProxies to multiple servers in your application.
 *
 *  Proxy executes operations on a single server-proxy it connects to.
 */

export class ServerProxy {
  // -------------------------------------------------------------------------
  // Public Readonly Properties
  // -------------------------------------------------------------------------

  /**
   * ServerProxy publicAttr.
   */
  public readonly name: string;

  /**
   * ServerProxy options.
   */
  public readonly options: ConnectionOptions;

  /**
   * Indicates if serverProxy is initialized or not.
   */
  public readonly isConnected = false;

  /*

    /!**
     * Logger used to log events.
     *!/
    readonly logger: Logger;

*/

  /**
   * EntitySchema subscriber instances that are registered for this serverProxy.
   */
  //    readonly subscribers: EntitySubscriberInterface<any>[] = [];

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(options: ConnectionOptions) {
    this.name = options.serverName || 'default';
    this.options = options;
    //        this.logger = new LoggerFactory().create(this.options.logger, this.options.logging);
    //        this.formatter = FormatterFactory.create(this);
  }

  /**
   * Performs serverProxy to the server-proxy.
   */
  public async connect(): Promise<this> {
    if (this.isConnected) {
      throw new ServiceError(
        'OperationFailed',
        `Server ${this.name} is already connected.`
      );
    }
    // create to the database via its data-server-proxy
    //        await this.protocolDriver.connect();

    // set connected status for the current serverProxy
    Object.assign(this, { isConnected: true });

    try {
      await this.afterConnect();
    } catch (error) {
      // if for some reason afterConnect fail serverProxy needs to be closed
      await this.close();
      throw error;
    }

    return this;
  }

  public afterConnect(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Closes serverProxy with the database.
   * Once serverProxy is closed, you cannot use manager and repositories or perform any operations except opening serverProxy again.
   */
  public async close(): Promise<void> {
    if (!this.isConnected) {
      throw new ServiceError(
        'OperationFailed',
        `Server ${this.name} is not connected.`
      );
    }
    Object.assign(this, { isConnected: false });
  }

  /**
   *  Executes request
   * @param request
   */
  public async execute(
    request: ServerRequest<unknown, unknown>
  ): Promise<ServerResponse<unknown>> {
    return new ServerResponse<unknown>();
  }

  public getCommandMaker(schema:TypeSchema):CommandMaker {
    return new CommandMaker(schema)
  }

  public getServerRequest<C,R>(cmd:C[]):ServerRequest<C,R> {
    return new ServerRequest('')
  }
}

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

import { ConnectionOptions } from './ConnectionOptions';
import { ServerProxy } from './ServerProxy';
import { ServiceError } from '../../../aelastics-result';

/**
 * ServerProxyManager is used to manager and manage multiple api-server-proxy serverProxies.
 * It also provides useful factory methods to simplify api-server-proxy serverProxy creation.
 */
export class ServerProxyManager {
  // -------------------------------------------------------------------------
  // Protected Properties
  // -------------------------------------------------------------------------

  /**
   * ListOf of serverProxies registered in this serverProxy manager.
   */
  protected readonly serverProxies: ServerProxy[] = [];

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Checks if serverProxy with the given publicAttr exist in the manager.
   */
  public has(name: string): boolean {
    return !!this.serverProxies.find((proxy) => proxy.name === name);
  }

  /**
   * Gets registered serverProxy with the given publicAttr.
   * If serverProxy publicAttr is not given then it will get a default serverProxy.
   * Throws error if serverProxy with the given publicAttr was not found.
   */
  public get(name: string = 'default'): ServerProxy {
    const proxy = this.serverProxies.find((proxy) => proxy.name === name);
    if (!proxy) {
      throw new ServiceError('OperationFailed', `Server ${name} not found.`);
    }
    return proxy;
  }

  /**
   * create server based on default options from environment varaiables
   */
  public create(): ServerProxy;

  /**
   * create server based on given options
   */
  public create(options: ConnectionOptions): ServerProxy;

  /**
   * Creates a new serverProxy based on the given serverProxy options and registers it in the manager.
   * ServerProxy won't be connected automatically, you'll need to manually call connect method
   */
  public create(options?: ConnectionOptions): ServerProxy {
    if (!options) {
      options = this.getDefaultConnectionOptions();
    }

    // check if such serverProxy is already registered
    const existConnection = this.serverProxies.find(
      (proxy) => proxy.name === (options!.serverName || 'default')
    );
    if (existConnection) {
      // if serverProxy is registered and its not closed then throw an error
      if (existConnection.isConnected) {
        throw new ServiceError(
          'OperationFailed',
          `Server ${options.serverName || 'default'} has active connection.`
        );
      }

      // if its registered but closed then simply remove it from the manager
      this.serverProxies.splice(this.serverProxies.indexOf(existConnection), 1);
    }

    // create a new serverProxy
    const proxy = new ServerProxy(options);
    this.serverProxies.push(proxy);
    return proxy;
  }

  public getDefaultConnectionOptions(): ConnectionOptions {
    return {
      serverType: process.env.SERVER_TYPE || 'AelasticS',
      serverName: process.env.SERVER_NAME || 'default',
      serverUrl: process.env.SERVER_URL || 'http://localhost',
      port: process.env.SERVER_PORT || '3000',
      username: process.env.SERVER_USERNAME || 'testUser',
      password: process.env.SERVER_PASSWORD || 'password',
      /*
            entities:[],
            subscribers:[]
*/
    };
  }
}

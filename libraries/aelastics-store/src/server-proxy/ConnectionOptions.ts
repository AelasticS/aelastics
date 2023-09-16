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



 //import {IObjectType} from "../common/ObjectTypes"
// import {ServerType} from "./ServerType";
/**
 * IConnectionOptions is set of serverProxy options shared by all database types.
 */
export interface ConnectionOptions {

    /**
     * Database serverType. This value is required.
     */
    readonly serverType: string; // ServerType correct values defined in  "./ServerType"

    /**
     * Connection publicAttr. If serverProxy publicAttr is not given then it will be called "default".
     * Different serverProxies must have different names.
     */
    readonly serverName: string;

    /**
     * Connection serverUrl to api-server-proxy.
     */
    readonly serverUrl: string;

    /**
     * api-server-proxy host port.
     */
    readonly port: string;

    /**
     * api-server-proxy username.
     */
    readonly username: string;

    /**
     * api-server-proxy password.
     */
    readonly password: string;



}

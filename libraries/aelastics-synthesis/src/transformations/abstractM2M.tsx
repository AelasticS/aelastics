/** @jsx STX.h */
/*
 * Copyright (c) AelasticS 2022.
 */

import { IModel } from "generic-metamodel";
import {STX} from "../jsx/handle"
import {M2M_Transformation, E2E_Transformation, M2M_Trace, E2E_Trace} from './transformation.model.components'
import { IM2M_Transformation } from "./transformation.model.type";


export abstract class abstractM2M<S extends IModel, T extends IModel> {
    // transformation type
    public m2mTRansformation?: IM2M_Transformation 
    
    
    public constructor(readonly source: S) {
            
    } 

    public abstract transform():STX.Child<T>

      public execute ():T {
        let dest = this.transform().instance
        // make M2M trace 
        let tr =  <M2M_Trace from={{id:this.source.id}} to={{id:dest.id}} instanceOf={this.m2mTRansformation}/>
        return dest
    }
 
}
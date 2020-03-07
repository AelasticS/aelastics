/*
 * Copyright (c) AelasticS 2019.
 */

import {SimpleTypeC} from "./SimpleType";
import {Error, failure, Result, success, Path, isSuccess} from "aelastics-result";



export class DateTypeC extends SimpleTypeC<Date, string> {
    public readonly _tag: 'Date' = 'Date';
    constructor() {
        super('Date');
    }

    public validate(input:Date, path:Path=[]):Result<boolean> {
        if(input instanceof Date && !isNaN(input.getTime()))
            return super.validate(input);
        return failure(new Error(`Value ${path}: '${input}' is not valid Date`));

    };

    public  fromDTO(value:string, path:Path = []):Result<Date> {
        try {
            const d = new Date(value);
            const res= this.validate(d,path);
            if(isSuccess(res)){
                return success(d);
            }else{
                return res;
            }

        }
        catch (e) {
            return failure(new Error(`Value ${path}: '${value}' is not valid Date`));
        }
    };
    //?
    public  toDTO(d:Date):Result<string>{

        return success(d.toJSON());
    }
}

/**
 *  date type
 */

export const date = new DateTypeC();

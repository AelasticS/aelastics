import * as t from '../../src/index';
import { isSuccess } from 'aelastics-result';
// import {TypeOf} from "..";

describe('Test cases for boolean type', () => {

    it('should verify that \'true\' is boolean.', () =>{

        const realBoolean = t.boolean;
        let value = true;
        expect(isSuccess(realBoolean.validate(value,[]))).toBe(true);

    });

    it('should verify that \'false\' is boolean.', () =>{

        const realBoolean = t.boolean;
        let value = false;
        expect(isSuccess(realBoolean.validate(value,[]))).toBe(true);

    });

    // compiler doesn't let us run this tests

    it('should verify that \'null\' is not boolean.', () =>{

        const realBoolean = t.boolean;
        let value = null;
        expect(isSuccess(realBoolean.validate(value as unknown as boolean,[]))).toBe(false);

    });


    it('should verify that \'undefined\' is not boolean.', () =>{

        const realBoolean = t.boolean;
        let value = undefined;
        expect(isSuccess(realBoolean.validate(value as unknown as boolean,[]))).toBe(false);

    });



     it('should verify that Number type value is not boolean.', () =>{

        const realBoolean = t.boolean;
        let value = 1;
        expect(isSuccess(realBoolean.validate(value as unknown as boolean,[]))).toBe(false);

    });

    it('should verify that String type is not boolean.', () =>{

        const realBoolean = t.boolean;
        let value = "abs";
        expect(isSuccess(realBoolean.validate(value as unknown as boolean,[]))).toBe(false);

    });

});

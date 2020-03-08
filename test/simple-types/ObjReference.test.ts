/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as t from '../../src/index';
import {isSuccess} from "aelastics-result";
// import {isSuccess} from "aelastics-result";


describe('Test identifiers for object reference', () => {
    const PersonTypeWithSimpleIdentifier = t.object({
        name: t.string,
        age: t.number
    }, 'person', undefined,"name");

    const PersonTypeWithComplexIdentifier = t.object({
        name: t.string,
        age: t.number
    }, 'person', undefined,["name", "age"]);

    it("should correctly verify when is given a single identifier", ()=> {
        let refType = t.ref(PersonTypeWithSimpleIdentifier);
        let p:t.TypeOf<typeof refType> ={age:6}
        expect(isSuccess(refType.validate(p))).toBeFalsy();
        p = {name:"pera"}      ;
        expect(refType.validate(p)).toBeTruthy();
    });

    it("should correctly verify when is given a complex identifier", ()=> {
        let refType = t.ref(PersonTypeWithComplexIdentifier);
        let p:t.TypeOf<typeof refType> ={age:6};
        expect(isSuccess(refType.validate(p))).toBeFalsy();
        p = {name:"pera", age:6}      ;
        expect(refType.validate(p)).toBeTruthy();
    });

});

describe('Test recursive object references', () => {
    const Person = t.object({
        name: t.string,
        age: t.number
    }, 'person', undefined,"name");


    it("should correctly verify when is given a single identifier", ()=> {
        let refType = t.ref(Person);
        let p:t.TypeOf<typeof refType> ={age:6}
        expect(isSuccess(refType.validate(p))).toBeFalsy();
        p = {name:"pera"}      ;
        expect(refType.validate(p)).toBeTruthy();
    });


});


import * as t from "aelastics-types"

const PKNaming = t.object({
    NoPrefixSufix: t.boolean,
    Prefix: t.boolean,
    Sufix: t.boolean
}, 'PKNaming', t.schema("PKNamingSchema"));


const FKNaming = t.object({
    RoleName: t.boolean,
    PKFromOriginTable: t.boolean
}, 'FKNaming', t.schema("FKNamingSchema"));

// da bi se dobila ovakva struktura, mora da se obiđe deo dm template, ne samo konkretne odluke
// jer u konkretnim odlukama nema stvari koje nisu odabrane (na primer, NoIndexes)

const IndexingStrategiesForFK = t.object({
    CreateIndex: FKNaming,
    NoIndexes: t.boolean
}, 'IndexingStrategiesForFK', t.schema("IndexingStrategiesForFKSchema"));

const Relationship_0_1_Handling = t.object({
    UseFK: FKNaming,
    UseSeparateTable: t.boolean
}, '0_1_RelationshipHandling', t.schema("0_1_RelationshipHandlingSchema"));

// const Relationship_0_1_Handling = t.taggedUnion( {
//     UseFK: FKNaming,
//     UseSeparateTable: t.boolean
// }, '0_1_RelationshipHandling', t.schema("0_1_RelationshipHandlingSchema"));

type IRelationship_0_1_HandlingUnion = {

    NoIndex: true,
    CreateIndex: false,
} | {
    NoIndex: false,
    CreateIndex: {
        RoleName: true
        PKFromOriginTable: false
    } | {
        RoleName: false
        PKFromOriginTable: true
    }| {
        RoleName: string
        PKFromOriginTable: true
    }
};


const alt1: IRelationship_0_1_HandlingUnion = { NoIndex: true, CreateIndex: false };
const alt2: IRelationship_0_1_HandlingUnion = { NoIndex: false, CreateIndex: { RoleName: true, PKFromOriginTable: false } };
const alt3: IRelationship_0_1_HandlingUnion = { NoIndex: false, CreateIndex: { RoleName: false, PKFromOriginTable: true } };


// const a = t.unio










export type IIndexingStrategiesForFK = t.TypeOf<typeof IndexingStrategiesForFK>;
export type IPKNaming = t.TypeOf<typeof PKNaming>;
export type IFKNaming = t.TypeOf<typeof FKNaming>;
export type IRelationship_0_1_Handling = t.TypeOf<typeof Relationship_0_1_Handling>;

const concreteIndexingStrategiesForFK: IIndexingStrategiesForFK = {
    CreateIndex: {
        RoleName: true,
        PKFromOriginTable: false
    },
    NoIndexes: false
};



function checkIfShouldBeCreatedByRoleName(decision: IRelationship_0_1_Handling): boolean {
    return decision.UseFK?.RoleName;
}

function checkIfShouldBeCreatedByPK(decision: IRelationship_0_1_Handling): boolean {
    return decision.UseFK?.PKFromOriginTable;
}

function checkIfSeparatedTableShouldBeCreated(decision: IRelationship_0_1_Handling): boolean {
    return decision.UseSeparateTable;
}

// ####################### primer 2, objekti sadrže samo odluke koje su odabrane

const IndexingStrategiesForFK2 = t.object({
    CreateIndex: FKNaming,
    NoIndexes: t.boolean
}, 'IndexingStrategiesForFK', t.schema("IndexingStrategiesForFKSchema2"));

const Relationship_0_1_Handling2 = t.object({
    UseFK: FKNaming,
}, '0_1_RelationshipHandling', t.schema("0_1_RelationshipHandlingSchema2"));

export type IIndexingStrategiesForFK2 = t.TypeOf<typeof IndexingStrategiesForFK2>;
export type IRelationship_0_1_Handling2 = t.TypeOf<typeof Relationship_0_1_Handling2>;

function checkIfShouldBeCreatedByRoleName2(decision: IRelationship_0_1_Handling2): boolean {
    return decision.UseFK?.RoleName;
}

function checkIfShouldBeCreatedByPK2(decision: IRelationship_0_1_Handling2): boolean {
    return decision.UseFK?.PKFromOriginTable;
}

// function checkIfSeparatedTableShouldBeCreated2(decision: IRelationship_0_1_Handling2): boolean {
//     // ako se naprave objekti koji sadrže samo odluke koje su odabrane, onda može da nastane greška,
//     // jer ovde ne postoji UseSeparateTable ako nije odabrano
//     return decision.UseSeparateTable;
// }
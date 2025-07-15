
import * as t from "aelastics-types"


// ############     PRIMER SA UNION OBJEKTIMA    ##############

type IRelationship_0_1_HandlingUnion = {

    NoIndex: true,
    CreateIndex: false,
} | {
    NoIndex: false,
    CreateIndex: {
        Issue1: {
            RoleName: {

            }
            PKFromOriginTable: false
        },
        Issue2: {
            RoleName: false
            PKFromOriginTable: true
        }

    } | {
        RoleName: false
        PKFromOriginTable: true
    } | {
        RoleName: string
        PKFromOriginTable: false
    }
};

type IRelationship = {
    ForeignKeyOrSeparateTable: {
        

    },
    FKNamingConvention: "ByRoleName" | "ByPKFromOriginTable",
    PKNamingConvention: "AddPrefix" | "AddSufix" | "NoPrefixSufix"
} |
{
    FKNamingConvention: "ByRoleName" | "ByPKFromOriginTable",
    PKNamingConvention: "AddPrefix" | "AddSufix" | "NoPrefixSufix"
};

/*

const fnc Relat = (el: IRelat) => {
return <IRelationship_0_1_HandlingUnion>
    <NoIndex>true</NoIndex>
    {uslov1(el) ? <CreateIndex>false</CreateIndex> : null }    
<IRelationship_0_1_HandlingUnion/>}

*/

const alt1: IRelationship_0_1_HandlingUnion = { NoIndex: true, CreateIndex: false };
const alt2: IRelationship_0_1_HandlingUnion = { NoIndex: false, CreateIndex: { RoleName: 'rola', PKFromOriginTable: false } };
const alt3: IRelationship_0_1_HandlingUnion = { NoIndex: false, CreateIndex: { RoleName: false, PKFromOriginTable: true } };


function checkIfShouldBeCreatedByRoleName2(decision: IRelationship_0_1_HandlingUnion): boolean {
    return (
        decision.CreateIndex !== false &&
        typeof decision.CreateIndex === "object" &&
        "RoleName" in decision.CreateIndex &&
        decision.CreateIndex.RoleName === false
    );
}

function checkIfShouldBeCreatedByPK2(decision: IRelationship_0_1_HandlingUnion): boolean {
    return (
        decision.CreateIndex !== false &&
        typeof decision.CreateIndex === "object" &&
        "PKFromOriginTable" in decision.CreateIndex &&
        decision.CreateIndex.PKFromOriginTable === true
    );
}

// ############     KRAJ PRIMERA SA UNION OBJEKTIMA    ##############


// ############     PRIMER SA NIZOM OBJEKATA    ##############

// type shouldCreateIndex = {
//     NoIndex: true,
//     CreateIndex: false
// } | {
//     NoIndex: false,
//     CreateIndex: true
// };

enum createIndexDecision {
    NoIndex,
    CreateIndex
}

// type createIndex = {
//     RoleName: true
//     PKFromOriginTable: false
// } | {
//     RoleName: false
//     PKFromOriginTable: true
// };

enum indexName {
    RoleName,
    PKFromOriginTable
}

type DecisionModel = {
    createIndexDecision: "NoIndex" | "CreateIndex",
    indexName: "RoleName" | "PKFromOriginTable"
};

type DecisionModel2 = "CreateIndex"

const desicion: DecisionModel = {
    createIndexDecision: "CreateIndex",
    indexName: "RoleName"
};


// const collectionOfDecisions2: Record<string, createIndexDecision | indexName> = {
//     'shouldCreateIndex': createIndexDecision.CreateIndex,
//     'createIndex': indexName.RoleName,
//     'createIndex22': indexName.RoleName
// };


function checkIfShouldBeCreatedByRoleNameArray(d: DecisionModel): boolean {

    if (d.createIndexDecision === "CreateIndex") { // if (d.CreateIndex)
        return d.indexName === "RoleName";
    }



    return false; // No index, so no need to check further

}






// ############     KRAJ PRIMERA SA NIZOM OBJEKATA    ##############






// ############     PRIMER SA AELASTYC TIPOVIMA    ##############

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

function checkIfShouldBeCreatedByRoleName3(decision: IRelationship_0_1_Handling2): boolean {
    return decision.UseFK?.RoleName;
}

function checkIfShouldBeCreatedByPK3(decision: IRelationship_0_1_Handling2): boolean {
    return decision.UseFK?.PKFromOriginTable;
}

// function checkIfSeparatedTableShouldBeCreated2(decision: IRelationship_0_1_Handling2): boolean {
//     // ako se naprave objekti koji sadrže samo odluke koje su odabrane, onda može da nastane greška,
//     // jer ovde ne postoji UseSeparateTable ako nije odabrano
//     return decision.UseSeparateTable;
// }

// ############     KRAJ PRIMERA SA AELASTYC TIPOVIMA    ##############
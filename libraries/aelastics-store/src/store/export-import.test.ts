/*
 * Created Date: Saturday, February 25th 2023
 * Author: Sinisa Neskovic
 *
 * Copyright (c) 2023 Aelastics
 */

import * as t from "aelastics-types";
import { Repository } from "./Repository";
import { Store } from "./Store";
import exp from "constants";

const PlaceType = t.entity(
  { placeID: t.number, name: t.string },
  ["placeID"],
  "PlaceType"
);

const PersonType = t.entity(
  {
    personID: t.number,
    name: t.string,
    age: t.number,
    children: t.arrayOf(t.link(t.DefaultSchema, "PersonType"), "children"),
    birthPlace: PlaceType,
    parent: t.optional(t.link(t.DefaultSchema, "PersonType"), "parent"),
  },
  ["personID"],
  "PersonType"
);

//TODO: invese props do not work when creating based on init object
t.inverseProps(PersonType, "children", PersonType, "parent");

type IPersonType = t.TypeOf<typeof PersonType>;
type IPlaceType = t.TypeOf<typeof PlaceType>;

describe("Test export", () => {
  let store: Store<any>;
  let peter: IPersonType;
  let place: IPlaceType;
  let repo: Repository<t.Any> = new Repository();
  beforeEach(() => {
    store = new Store<string>();
  });

  it("should export a complex object with a cyclic structure", () => {
    place = store.deepCreate<IPlaceType>(PlaceType, {
      placeID: 2092,
      name: "Charlottenlund",
    });
    peter = store.deepCreate<IPersonType>(PersonType, {
      name: "Peter",
      personID: 1,
      age: 35,
      birthPlace: place,   // birthPlace is shared with parent
      parent: { name: "Tom", personID: 4, age: 60, birthPlace: place },
      children: [
        { name: "John", personID: 2, age: 10, birthPlace: place },
        { name: "Ana", personID: 3, age: 5, birthPlace: place }
      ],

    });
    peter.parent.parent = peter  // this makes Tom as both parent and child of Peter
    let exp = repo.exportToDTO(PersonType, peter);
    expect(exp).toEqual({
      ref: {
        typeName: "/DefaultSchema/PersonType",
        category: "Object",
        id: 1,
      },
      object: {
        personID: 1,
        name: "Peter",
        age: 35,
        children: {
          ref: {
            typeName: "/DefaultSchema/children",
            category: "Array",
            id: 2,
          },
          array: [
            {
              ref: {
                typeName: "/DefaultSchema/PersonType",
                category: "Object",
                id: 3,
              },
              object: {
                personID: 2,
                name: "John",
                age: 10,
                children: {
                  ref: {
                    typeName: "/DefaultSchema/children",
                    category: "Array",
                    id: 4,
                  },
                  array: [
                  ],
                },
                birthPlace: {
                  ref: {
                    typeName: "/DefaultSchema/PlaceType",
                    category: "Object",
                    id: 5,
                  },
                  object: {
                    placeID: 2092,
                    name: "Charlottenlund",
                  },
                },
                parent: undefined,
              },
            },
            {
              ref: {
                typeName: "/DefaultSchema/PersonType",
                category: "Object",
                id: 6,
              },
              object: {
                personID: 3,
                name: "Ana",
                age: 5,
                children: {
                  ref: {
                    typeName: "/DefaultSchema/children",
                    category: "Array",
                    id: 7,
                  },
                  array: [
                  ],
                },
                birthPlace: {
                  ref: {
                    typeName: "/DefaultSchema/PlaceType",
                    category: "Object",
                    id: 5,
                  },
                },
                parent: undefined,
              },
            },
            {
              ref: {
                typeName: "/DefaultSchema/PersonType",
                category: "Object",
                id: 8,
              },
              object: {
                personID: 4,
                name: "Tom",
                age: 60,
                children: {
                  ref: {
                    typeName: "/DefaultSchema/children",
                    category: "Array",
                    id: 9,
                  },
                  array: [
                  ],
                },
                birthPlace: {
                  ref: {
                    typeName: "/DefaultSchema/PlaceType",
                    category: "Object",
                    id: 5,
                  },
                },
                parent: {
                  ref: {
                    typeName: "/DefaultSchema/PersonType",
                    category: "Object",
                    id: 1,
                  },
                },
              },
            },
          ],
        },
        birthPlace: {
          ref: {
            typeName: "/DefaultSchema/PlaceType",
            category: "Object",
            id: 5,
          },
        },
        parent: {
          ref: {
            typeName: "/DefaultSchema/PersonType",
            category: "Object",
            id: 8,
          },
        },
      },
    });
  });
});

describe("Test import", ()=>{
  let store: Store<any>;
  let repo: Repository<t.Any> = new Repository();

  beforeEach(() => {
    store = new Store<string>();
  });

  it("should import from JSON an object with cyclic structure into store", ()=>{
    let inputDTO = {
      ref: {
        typeName: "/DefaultSchema/PersonType",
        category: "Object",
        id: 1,
      },
      object: {
        personID: 1,
        name: "Peter",
        age: 35,
        children: {
          ref: {
            typeName: "/DefaultSchema/children",
            category: "Array",
            id: 2,
          },
          array: [
            {
              ref: {
                typeName: "/DefaultSchema/PersonType",
                category: "Object",
                id: 3,
              },
              object: {
                personID: 2,
                name: "John",
                age: 10,
                children: {
                  ref: {
                    typeName: "/DefaultSchema/children",
                    category: "Array",
                    id: 4,
                  },
                  array: [
                  ],
                },
                birthPlace: {
                  ref: {
                    typeName: "/DefaultSchema/PlaceType",
                    category: "Object",
                    id: 5,
                  },
                  object: {
                    placeID: 2092,
                    name: "Charlottenlund",
                  },
                },
                parent: undefined,
              },
            },
            {
              ref: {
                typeName: "/DefaultSchema/PersonType",
                category: "Object",
                id: 6,
              },
              object: {
                personID: 3,
                name: "Ana",
                age: 5,
                children: {
                  ref: {
                    typeName: "/DefaultSchema/children",
                    category: "Array",
                    id: 7,
                  },
                  array: [
                  ],
                },
                birthPlace: {
                  ref: {
                    typeName: "/DefaultSchema/PlaceType",
                    category: "Object",
                    id: 5,
                  },
                },
                parent: undefined,
              },
            },
            {
              ref: {
                typeName: "/DefaultSchema/PersonType",
                category: "Object",
                id: 8,
              },
              object: {
                personID: 4,
                name: "Tom",
                age: 60,
                children: {
                  ref: {
                    typeName: "/DefaultSchema/children",
                    category: "Array",
                    id: 9,
                  },
                  array: [
                  ],
                },
                birthPlace: {
                  ref: {
                    typeName: "/DefaultSchema/PlaceType",
                    category: "Object",
                    id: 5,
                  },
                },
                parent: {
                  ref: {
                    typeName: "/DefaultSchema/PersonType",
                    category: "Object",
                    id: 1,
                  },
                },
              },
            },
          ],
        },
        birthPlace: {
          ref: {
            typeName: "/DefaultSchema/PlaceType",
            category: "Object",
            id: 5,
          },
        },
        parent: {
          ref: {
            typeName: "/DefaultSchema/PersonType",
            category: "Object",
            id: 8,
          },
        },
      },
    }

    let res = repo.importFromDTO(PersonType, inputDTO)
    expect(res).toBeTruthy()
    
  })
})

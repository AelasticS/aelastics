/*
 * Created Date: Saturday, February 25th 2023
 * Author: Sinisa Neskovic
 *
 * Copyright (c) 2023 Aelastics
 */

import * as t from "aelastics-types";
import { Repository } from "./Repository";
import { Store } from "./Store";

const PlaceType = t.entity(
  { placeID: t.number, name: t.string },
  ["placeID"],
  "PlaceType"
);
const ProjectType = t.entity(
  {
    projectID: t.number,
    name: t.string,
    projectTeam: t.arrayOf(
      t.link(t.DefaultSchema, "PersonType"),
      "projectTeam"
    ),
  },
  ["projectID"],
  "ProjectType"
);

const PersonType = t.entity(
  {
    personID: t.number,
    name: t.string,
    age: t.number,
    children: t.arrayOf(t.link(t.DefaultSchema, "PersonType"), "children"),
    birthPlace: PlaceType,
    parent: t.optional(t.link(t.DefaultSchema, "PersonType"), "parent"),
    projects: t.arrayOf(ProjectType, "projects"),
  },
  ["personID"],
  "PersonType"
);
t.inverseProps(PersonType, "children", PersonType, "parent");
t.inverseProps(PersonType, "projects", ProjectType, "projectTeam");

type IPersonType = t.TypeOf<typeof PersonType>;
type IProjectType = t.TypeOf<typeof ProjectType>;
type IPlaceType = t.TypeOf<typeof PlaceType>;

describe("Test export", () => {
  let store: Store<any>;
  let peter: IPersonType;
  let place: IPlaceType;
  let repo: Repository<t.Any> = new Repository();
  beforeEach(() => {
    store = new Store(PersonType);
    place = store.new<IPlaceType>(PlaceType, {placeID:2092, name:"Charlottenlund"})
    peter = store.new<IPersonType>(PersonType, 
      { name: "Peter", personID:1, age:35, birthPlace:place
      });
    expect(peter).toBeTruthy();
  });

  it("should export object with simple properties", () => {
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
          ],
        },
        birthPlace: {
          ref: {
            typeName: "/DefaultSchema/PlaceType",
            category: "Object",
            id: 3,
          },
          object: {
            placeID: 2092,
            name: "Charlottenlund",
          },
        },
        parent: undefined,
        projects: {
          ref: {
            typeName: "/DefaultSchema/projects",
            category: "Array",
            id: 4,
          },
          array: [
          ],
        },
      },
    });
  });

  it("should export object with simple optional properties", () => {});

  it("should export object with object properties", () => {});

  it("should export object with array properties", () => {});

  it("should export object with array properties", () => {});
});

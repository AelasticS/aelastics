import { Repository } from './Repository';
import * as t from 'aelastics-types';
import { observable } from 'mobx';
import {
  Action,
  CollectionElementInserted,
  EventLog,
  EventType,
  PropertyChanged
} from '../eventLog/EventLog';
import { Store } from './Store';

const PlaceType = t.entity({ placeID: t.number, name: t.string }, ['placeID'], 'PlaceType');
const ProjectType = t.entity(
  {
    projectID: t.number,
    name: t.string,
    projectTeam: t.arrayOf(t.link(t.DefaultSchema, 'PersonType'), 'projectTeam')
  },
  ['projectID'],
  'ProjectType'
);

const PersonType = t.entity(
  {
    personID: t.number,
    name: t.string,
    age: t.number,
    children: t.arrayOf(t.link(t.DefaultSchema, 'PersonType'), 'children'),
    birthPlace: PlaceType,
    parent: t.optional(t.link(t.DefaultSchema, 'PersonType'), 'parent'),
    projects: t.arrayOf(ProjectType, 'projects')
  },
  ['personID'],
  'PersonType'
);
t.inverseProps(PersonType, 'children', PersonType, 'parent');
t.inverseProps(PersonType, 'projects', ProjectType, 'projectTeam');

type IPersonType = t.TypeOf<typeof PersonType>;
type IProjectType = t.TypeOf<typeof ProjectType>;

describe('example abstract model', () => {
  let store: Store<any>;
  let log: EventLog;
  let peter: IPersonType;
  beforeEach(() => {
    store = new Store(PersonType);
    log = store.eventLog
    peter = store.new<IPersonType>(PersonType, { name: 'Peter' });
    expect(peter).toBeTruthy();
  });
  it('should log the change of the not inversed property', () => {
    peter.name = 'Peter updated';
    expect(log.lastAction.events.length).toEqual(2);
    expect(
      log.lastAction.events.findIndex((item) => {
        const pi: PropertyChanged = item as any;
        return (
          pi.type === EventType.PropertyChanged && pi.object === peter && pi.newValue === 'Peter updated'
        );
      }) > -1
    );
  });
  it('should undo the change of name', () => {
    peter.name = 'Peter';
    expect(peter.name).toEqual('Peter');
    log.createAction('update name');
    peter.name = 'John';
    expect(peter.name).toEqual('John');
    log.undo();
    expect(peter.name).toEqual('Peter');
  });
  it('should log the change of the parent', () => {
    log.createAction('update parent');
    let child = store.new<IPersonType>(PersonType, { name: 'child' });
    child.parent = peter;
    expect(peter.children.includes(child)).toBeTruthy();
    expect(log.lastAction.events.length).toEqual(2);
    expect(
      log.lastAction.events.findIndex((item) => {
        const pi: PropertyChanged = item as any;
        return (
          pi.type === EventType.PropertyChanged &&
          pi.object === child &&
          pi.property === 'parent' &&
          pi.newValue === peter
        );
      }) > -1
    );
    let parent2 = store.new<IPersonType>(PersonType, { name: 'parent2' });
    child.parent = parent2;

    expect(child.parent).toEqual(parent2);
    expect(peter.children.includes(child)).toBeFalsy();

    expect(parent2.children.includes(child)).toBeTruthy();
    expect(log.lastAction.events.length).toEqual(4);

    expect(
      log.lastAction.events.findIndex((item) => {
        const pi: PropertyChanged = item as any;
        return (
          pi.type === EventType.PropertyChanged &&
          pi.object === child &&
          pi.property === 'parent' &&
          pi.newValue === parent2
        );
      }) > -1
    );
  });
  it('should log the change of the children', () => {
    log.createAction('update parent');
    let child1 = store.new<IPersonType>(PersonType, { name: 'child1' });
    peter.children.push(child1);
    expect(child1.parent === peter).toBeTruthy(); // set child's parent property
    expect(log.lastAction.events.length).toEqual(2);
    expect(
      // there exist a log item
      log.lastAction.events.findIndex((item) => {
        const pi: CollectionElementInserted = item as any;
        return (
          pi.type === EventType.PropertyChanged &&
          pi.object === peter &&
          pi.property === 'children' &&
          pi.secondArgObject === child1
        );
      }) > -1
    );

    let parent2 = store.new<IPersonType>(PersonType, { name: 'parent2' });
    parent2.children.push(child1);
    expect(log.lastAction.events.length).toEqual(4);
    expect(child1.parent === parent2).toBeTruthy(); // set child's parent property
    expect(peter.children.length === 0).toBeTruthy(); // remove from old parent's colection
    expect(
      log.lastAction.events.findIndex((item) => {
        const pi: CollectionElementInserted = item as any;
        return (
          pi.type === EventType.ElementInserted &&
          pi.object === parent2 &&
          pi.property === 'children' &&
          pi.secondArgObject === child1
        );
      }) > -1
    );

    let child2 = store.new<IPersonType>(PersonType, { name: 'child2' });
    child2.parent = peter;
    parent2.children[0] = child2; // replace new child
    expect(child1.parent === undefined).toBeTruthy(); // nullified child1's parent property
    expect(child2.parent === parent2).toBeTruthy(); // set child2's parent property
    expect(peter.children.length === 0).toBeTruthy(); // removed from old parent's colection
    expect(log.lastAction.events.length).toEqual(8);
    expect(
      log.lastAction.events.findIndex((item) => {
        const pi: CollectionElementInserted = item as any;
        return (
          pi.type === EventType.ElementInserted &&
          pi.object === parent2 &&
          pi.property === 'children' &&
          pi.secondArgObject === child1
        );
      }) > -1
    );
  });
  test('array-to-array inverse properties, when push, pop ', () => {
    log.createAction('update array-to-array inverse properties');
    let project1 = store.new<IProjectType>(ProjectType, { name: 'project1' });
    peter.projects.push(project1);
    expect(project1.projectTeam.includes(peter)).toBeTruthy();
    project1.projectTeam.pop();
    expect(peter.projects.length === 0).toBeTruthy();
  });
  test('array-to-array inverse properties, when replacing', () => {
    log.createAction('update array-to-array inverse properties');
    let project1 = store.new<IProjectType>(ProjectType, { name: 'project1' });
    let project2 = store.new<IProjectType>(ProjectType, { name: 'project2' });
    peter.projects.push(project1);
    expect(project1.projectTeam.includes(peter)).toBeTruthy();
    peter.projects[0] = project2;
    expect(project1.projectTeam.length === 0).toBeTruthy();
    expect(project2.projectTeam[0] === peter).toBeTruthy();
  });
});

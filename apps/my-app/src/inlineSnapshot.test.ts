// This example is adapted from the Jest guide here:
// https://jestjs.io/docs/en/es6-class-mocks#automatic-mock


import {SoundPlayer} from './SoundPlayer'
import { MyClass } from 'my-controls';
let myClass: MyClass = new MyClass();
myClass.doSomething();

const sp: SoundPlayer = new SoundPlayer();
const coolSoundFileName: string = 'song.mp3';
sp.playSoundFile(coolSoundFileName);

it('Generate an inline snapshot', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thing: any = {
    abc: 123,
    def: {
      ghi: 'test!'
    }
  };




expect(thing).toMatchInlineSnapshot(`
    Object {
      "abc": 123,
      "def": Object {
        "ghi": "test!",
      },
    }
  `);
});




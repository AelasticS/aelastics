class Org {
  get radnici(): readonly Radnik[] {
    return Object.freeze([...this._radnici])
  }

  public _radnici: Radnik[] = []
}

class Radnik {
  private _org: Org | undefined

  get org(): Org | undefined {
    return this._org
  }

  set org(value: Org | undefined) {
    let oldOrg = this._org
    this._org = value
    if (value && !value._radnici.includes(this)) {
      value._radnici.push(this)
    }
    if (oldOrg) {
      for (let i = 0; i < oldOrg._radnici.length; i++) {
        if (oldOrg._radnici[i] === this) {
          oldOrg._radnici.splice(i, 1)
          return
        }
      }
    }
  }
}

describe('Test cases for traversal', () => {
  let r = new Radnik()
  let o = new Org()
  /*  Object.defineProperty(o, 'radnici', {
    value: o['_radnici'],
    writable: false
  })*/
  // @ts-ignore
  // o['radnici'].push(r)

  test('that private array is updated - added new ', () => {
    r.org = o
    //    console.log(`length:${o._radnici.length}`)
    expect(o._radnici.length).toEqual(1)
  })
  const f = () => {
    // @ts-ignore
    o['radnici'].push(r)
    return 1
  }
  test('that public array is frozen', () => {
    expect(f).toThrowError()
  })

  test('that private array is updated - deleted one', () => {
    r.org = undefined
    expect(o._radnici.length).toEqual(0)
  })
})

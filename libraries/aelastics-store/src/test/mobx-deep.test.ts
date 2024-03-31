import { autorun , observable } from 'mobx'

describe('Test cases for traversal', () => {
    let oracle = observable({
      name: 'oracle',
      workers: [] as any[],
      manager: undefined as any
    })

  let ibm = {
    name: 'IBM',
    workers: [] as any[],
    manager: undefined as any,
    sister:oracle
  }

  let worker = {
    name: 'Peter',
    employer: undefined as any,
    managerOf: undefined as any
  }

  ibm = observable(ibm)
//  oracle = observable(oracle)
//  worker = observable(worker)

  autorun(() => {
    console.log(`oracle:${oracle.name}, manager:${oracle.manager?.name}`)
  })
  autorun(() => {
    console.log(`ibm:${ibm.name}, manager:${ibm.manager?.name}, sister:${ibm.sister.name}`)
  })
  autorun(() => {
    console.log(`worker:${worker.name}, manager:${worker.managerOf?.name}`)
  })

  worker.managerOf = oracle
  ibm.workers.push(worker)


  test("prvi", ()=>{
    ibm.name ='ibm2'
    oracle.name = 'oracle2'
    oracle.name = 'oracle3'
    expect(oracle.name).toEqual("oracle3")
  })
}
)

import chai from 'chai'
import LazyPoint from '../src/LazyPoint'

chai.should()

describe('LazyPoint', () => {
  it('Should be instantiatable with two coordinates', () => {
    const p = new LazyPoint(100, 50)

    p.x.should.be.a('number')
    p.x.should.equal(100)

    p.y.should.be.a('number')
    p.y.should.equal(50)
  })

  it('Should update coordinates correctly', () => {
    const p = new LazyPoint(10, 20)

    const pNew = new LazyPoint(500, 300)

    p.update(pNew)

    p.x.should.equal(500)
    p.y.should.equal(300)
  })

  it('Should move point by angle correctly', () => {
    const p = new LazyPoint(100, 100)

    // This equals to 90° in radians
    const angle = Math.PI / 2
    p.moveByAngle(angle, 100)

    p.x.should.equal(100)
    p.y.should.equal(200)
  })

  it('Should compare equality to another point correctly', () => {
    const p = new LazyPoint(300, 300)

    const p1 = new LazyPoint(300, 300)
    const p2 = new LazyPoint(299, 300)
    const p3 = new LazyPoint(301, 300)
    const p4 = new LazyPoint(301, 299)
    const p5 = new LazyPoint(300, 300.000000000001)

    const r1 = p.equalsTo(p1)
    const r2 = p.equalsTo(p2)
    const r3 = p.equalsTo(p3)
    const r4 = p.equalsTo(p4)
    const r5 = p.equalsTo(p5)

    r1.should.equal(true)
    r2.should.equal(false)
    r3.should.equal(false)
    r4.should.equal(false)
    r5.should.equal(false)
  })

  it('Should calculate the difference between another point correctly', () => {
    const p1 = new LazyPoint(300, 300)
    const p2 = new LazyPoint(300, 600)

    const r = p1.getDifferenceTo(p2)

    r.x.should.equal(0)
    r.y.should.equal(-300)
  })

  it('Should calculate the distance to another point correctly', () => {
    const p1 = new LazyPoint(300, 300)
    const p2 = new LazyPoint(300, 600)

    const r = p1.getDistanceTo(p2)

    r.should.equal(300)
  })

  it('Should calculate the angle to another point correctly', () => {
    const p1 = new LazyPoint(500, 500)
    const p2 = new LazyPoint(1000, 500)

    const r = p1.getAngleTo(p2)

    r.should.equal(Math.PI)
  })

  it('Should return a coordinates object correctly', () => {
    const p = new LazyPoint(511.5932, 159.999994)

    const r = p.toObject()

    r.should.be.a('object')
    r.x.should.equal(511.5932)
    r.y.should.equal(159.999994)
  })


})

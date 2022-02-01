import chai from 'chai'
import Point from '../src/Point'

chai.should()

describe('Point', () => {
  it('Should be instantiatable with two coordinates', () => {
    const p = new Point(100, 50)

    p.x.should.be.a('number')
    p.x.should.equal(100)

    p.y.should.be.a('number')
    p.y.should.equal(50)
  })
})

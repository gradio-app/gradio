import chai from 'chai'
import LazyBrush from '../src/LazyBrush'

import { RADIUS_DEFAULT } from '../src/settings'

chai.should()

describe('LazyBrush', () => {
  it('Should be instantiatable with a radius and options', () => {
    const b = new LazyBrush({ radius: 100, enabled: false })

    b.pointer.x.should.equal(0)
    b.pointer.y.should.equal(0)
    b.brush.x.should.equal(0)
    b.brush.y.should.equal(0)

    b.radius.should.equal(100)
    b.isEnabled.should.equal(false)
  })

  it('Should be instantiatable without radius and options', () => {
    const b = new LazyBrush()

    b.radius.should.equal(RADIUS_DEFAULT)
    b.isEnabled.should.equal(true)
  })

  it('Should enable lazy brush', () => {
    const b = new LazyBrush({ enabled: false })

    b.enable()

    b.isEnabled.should.equal(true)
  })

  it('Should disable lazy brush', () => {
    const b = new LazyBrush()

    b.disable()

    b.isEnabled.should.equal(false)
  })

  it('Should set radius correctly', () => {
    const b = new LazyBrush()

    b.radius.should.equal(RADIUS_DEFAULT)

    b.setRadius(156)

    b.radius.should.equal(156)
  })

  it('Should update pointer points corrently', () => {
    const b = new LazyBrush({ radius: 100 })

    b.update({ x: 500, y: 1000 })

    b.pointer.x.should.equal(500)
    b.pointer.y.should.equal(1000)
  })

  it('Should detect changes corectly', () => {
    const b = new LazyBrush({ radius: 100 })

    const hasChanged1 = b.update({ x: 10, y: 10 })
    hasChanged1.should.equal(true)

    const hasChanged2 = b.update({ x: 10, y: 10 })
    hasChanged2.should.equal(false)
  })

  it('Should not move brush when pointer is inside radius', () => {
    const b = new LazyBrush({ radius: 100 })

    b.update({ x: 10, y: 10 })

    b.brush.x.should.equal(0)
    b.brush.y.should.equal(0)
  })

  it('Should move brush when pointer is outside radius on the right', () => {
    const b = new LazyBrush({ radius: 100 })

    b.update({ x: 100, y: 0})
    b.update({ x: 300, y: 0})

    b.brush.x.should.equal(200)
    b.brush.y.should.equal(0)
  })

  it('Should move brush when pointer is outside radius on the left', () => {
    const b = new LazyBrush({ radius: 100 })

    b.update({ x: 500, y: 0})
    b.brush.x.should.equal(400)

    b.update({ x: 400, y: 0})
    b.brush.x.should.equal(400)

    b.update({ x: 300, y: 0})
    b.brush.x.should.equal(400)

    b.update({ x: 100, y: 0})
    b.brush.x.should.equal(200)
  })

  it('Should move brush when pointer is outside radius the bottom right', () => {
    const b = new LazyBrush({ radius: 100 })

    b.update({ x: 1071, y: 1071})
    b.brush.x.should.equal(1000)
    b.brush.y.should.equal(1000)
  })
})

# lazy-brush - smooth drawing with a mouse, finger or any pointing device

**[Demo drawing app](https://lazybrush.dulnan.net)**

[Example repository](https://github.com/dulnan/lazy-brush-demo)

This library provides the math required to implement a "lazy brush".
It takes a radius and the {x,y} coordinates of a mouse/pointer and calculates
the position of the brush.
The brush will only move when the pointer is outside the "lazy area" of the
brush. With this technique it's possible to freely draw smooth lines and curves
with just a pointer or finger.

# How it works
When the position of the pointer is updated, the distance to the brush is
calculated. If this distance is larger than the defined radius, the brush will
be moved by `distance - radius` pixels in the direction where the pointer is.

# Usage
LazyBrush can be easily added in any canvas drawing scenario. It acts like a
"proxy" between user input and drawing.

```javascript
const lazy = new LazyBrush({
  radius: 30,
  enabled: true,
  initialPoint: { x: 0, y: 0 }
}) // default

lazy.update({ x: 50, y: 0 })
console.log(lazy.getBrushCoordinates()) // { x: 0, y: 0 }

lazy.update({ x: 200, y: 50 })
console.log(lazy.getBrushCoordinates()) // { x: 100, y: 0 }
```

Use the `LazyBrush.update()` function to update the pointer position. That
would be when the mouse is moved. The function returns a boolean to indicate
whether any of the values (brush or pointer) have changed. This can be used to
prevent unneccessary canvas redrawing.
If you need to know if the position of the brush was changed, you can get that
boolean via LazyBrush.brushHasMoved().

To get the coordinates , use `LazyBrush.getBrushCoordinates()` or
`LazyBrush.getPointerCoordinates()`. This will return an object with x and y
properties.

The functions `getBrush()` and `getPointer()` will return a `LazyPoint`, which
has some functions like getDistanceTo, getAngleTo or equalsTo.

## Performance
For performance reasons it's best to decouple calculations and canvas rendering
from mousemove/touchmove events: One way is to store the current coordinates in
a variable. Then, using an animation loop (typically requestAnimationFrame),
call the `LazyBrush.update()` function on every frame with the latest
coordinates from the variable.

The library will only do calculations if the pointer or brush values changed.

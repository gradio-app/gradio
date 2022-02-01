# Cropper.js

[![Build Status](https://img.shields.io/travis/fengyuanchen/cropperjs.svg)](https://travis-ci.org/fengyuanchen/cropperjs) [![Downloads](https://img.shields.io/npm/dm/cropperjs.svg)](https://www.npmjs.com/package/cropperjs) [![Version](https://img.shields.io/npm/v/cropperjs.svg)](https://www.npmjs.com/package/cropperjs) [![Gzip Size](https://img.shields.io/bundlephobia/minzip/cropperjs.svg)](https://unpkg.com/cropperjs/dist/cropper.common.js) [![Dependencies](https://img.shields.io/david/fengyuanchen/cropperjs.svg)](https://www.npmjs.com/package/cropperjs)

> JavaScript image cropper.

- [Website](https://fengyuanchen.github.io/cropperjs)
- [Photo Editor](https://fengyuanchen.github.io/photo-editor) - An advanced example of Cropper.js.
- [jquery-cropper](https://github.com/fengyuanchen/jquery-cropper) - A jQuery plugin wrapper for Cropper.js.

## Table of contents

- [Features](#features)
- [Main](#main)
- [Getting started](#getting-started)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [License](#license)

## Features

- Supports 39 [options](#options)
- Supports 27 [methods](#methods)
- Supports 6 [events](#events)
- Supports touch (mobile)
- Supports zooming
- Supports rotating
- Supports scaling (flipping)
- Supports multiple croppers
- Supports to crop on a canvas
- Supports to crop an image in the browser-side by canvas
- Supports to translate Exif Orientation information
- Cross-browser support

## Main

```text
dist/
├── cropper.css
├── cropper.min.css   (compressed)
├── cropper.js        (UMD)
├── cropper.min.js    (UMD, compressed)
├── cropper.common.js (CommonJS, default)
└── cropper.esm.js    (ES Module)
```

## Getting started

### Installation

```shell
npm install cropperjs
```

In browser:

```html
<link  href="/path/to/cropper.css" rel="stylesheet">
<script src="/path/to/cropper.js"></script>
```

[cdnjs](https://github.com/cdnjs/cdnjs) provides CDN support for Cropper.js's CSS and JavaScript. You can find the links [here](https://cdnjs.com/libraries/cropperjs).

### Usage

#### Syntax

```js
new Cropper(element[, options])
```

- **element**
  - Type: `HTMLImageElement` or `HTMLCanvasElement`
  - The target image or canvas element for cropping.

- **options** (optional)
  - Type: `Object`
  - The options for cropping. Check out the available [options](#options).

#### Example

```html
<!-- Wrap the image or canvas element with a block element (container) -->
<div>
  <img id="image" src="picture.jpg">
</div>
```

```css
/* Ensure the size of the image fit the container perfectly */
img {
  display: block;

  /* This rule is very important, please don't ignore this */
  max-width: 100%;
}
```

```js
// import 'cropperjs/dist/cropper.css';
import Cropper from 'cropperjs';

const image = document.getElementById('image');
const cropper = new Cropper(image, {
  aspectRatio: 16 / 9,
  crop(event) {
    console.log(event.detail.x);
    console.log(event.detail.y);
    console.log(event.detail.width);
    console.log(event.detail.height);
    console.log(event.detail.rotate);
    console.log(event.detail.scaleX);
    console.log(event.detail.scaleY);
  },
});
```

#### FAQ

How to crop a new area after zoom in or zoom out?

> Just double-click your mouse to enter crop mode.

How to move the image after cropping an area?

> Just double click your mouse to enter move mode.

How to fix aspect ratio in free ratio mode?

> Just hold the `Shift` key when you resize the crop box.

How to crop a square area in free ratio mode?

> Just hold the `Shift` key when you crop on the image.

#### Notes

- The size of the cropper inherits from the size of the image's parent element (wrapper), so be sure to wrap the image with a **visible block element**.
  > If you are using cropper in a modal, you should initialize the cropper after the modal is shown completely. Otherwise, you will not get the correct cropper.

- The outputted cropped data is based on the original image size, so you can use them to crop the image directly.

- If you try to start cropper on a cross-origin image, please make sure that your browser supports HTML5 [CORS settings attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes), and your image server supports the `Access-Control-Allow-Origin` option (see the [HTTP access control (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)).

#### Known issues

- [Known iOS resource limits](https://developer.apple.com/library/mac/documentation/AppleApplications/Reference/SafariWebContent/CreatingContentforSafarioniPhone/CreatingContentforSafarioniPhone.html): As iOS devices limit memory, the browser may crash when you are cropping a large image (iPhone camera resolution). To avoid this, you may resize the image first (preferably below 1024 pixels) before starting a cropper.

- Known image size increase: When exporting the cropped image on the browser side with the `HTMLCanvasElement.toDataURL` method, the size of the exported image may be greater than the original image's. This is because the type of the exported image is not the same as the original image's. So just pass the original image's type as the first parameter to `toDataURL` to fix this. For example, if the original type is JPEG, then use `cropper.getCroppedCanvas().toDataURL('image/jpeg')` to export image.

[⬆ back to top](#table-of-contents)

## Options

You may set cropper options with `new Cropper(image, options)`.
If you want to change the global default options, You may use `Cropper.setDefaults(options)`.

### viewMode

- Type: `Number`
- Default: `0`
- Options:
  - `0`: no restrictions
  - `1`: restrict the crop box not to exceed the size of the canvas.
  - `2`: restrict the minimum canvas size to fit within the container. If the proportions of the canvas and the container differ, the minimum canvas will be surrounded by extra space in one of the dimensions.
  - `3`: restrict the minimum canvas size to fill fit the container. If the proportions of the canvas and the container are different, the container will not be able to fit the whole canvas in one of the dimensions.

Define the view mode of the cropper. If you set `viewMode` to `0`, the crop box can extend outside the canvas, while a value of `1`, `2`, or `3` will restrict the crop box to the size of the canvas. `viewMode` of `2` or `3` will additionally restrict the canvas to the container. There is no difference between `2` and `3` when the proportions of the canvas and the container are the same.

### dragMode

- Type: `String`
- Default: `'crop'`
- Options:
  - `'crop'`: create a new crop box
  - `'move'`: move the canvas
  - `'none'`: do nothing

Define the dragging mode of the cropper.

### initialAspectRatio

- Type: `Number`
- Default: `NaN`

Define the initial aspect ratio of the crop box. By default, it is the same as the aspect ratio of the canvas (image wrapper).

> Only available when the `aspectRatio` option is set to `NaN`.

### aspectRatio

- Type: `Number`
- Default: `NaN`

Define the fixed aspect ratio of the crop box. By default, the crop box has a free ratio.

### data

- Type: `Object`
- Default: `null`

The previous cropped data you stored will be passed to the `setData` method automatically when initialized.

> Only available when the `autoCrop` option had set to the`true`.

### preview

- Type: `Element`, `Array` (elements), `NodeList` or `String` (selector)
- Default: `''`
- An element or an array of elements or a node list object or a valid selector for [Document.querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll)

Add extra elements (containers) for preview.

**Notes:**

- The maximum width is the initial width of the preview container.
- The maximum height is the initial height of the preview container.
- If you set an `aspectRatio` option, be sure to set the same aspect ratio to the preview container.
- If the preview does not display correctly, set the `overflow: hidden` style to the preview container.

### responsive

- Type: `Boolean`
- Default: `true`

Re-render the cropper when resizing the window.

### restore

- Type: `Boolean`
- Default: `true`

Restore the cropped area after resizing the window.

### checkCrossOrigin

- Type: `Boolean`
- Default: `true`

Check if the current image is a cross-origin image.

If so, a `crossOrigin` attribute will be added to the cloned image element, and a timestamp parameter will be added to the `src` attribute to reload the source image to avoid browser cache error.

Adding a `crossOrigin` attribute to the image element will stop adding a timestamp to the image URL and stop reloading the image. But the request (XMLHttpRequest) to read the image data for orientation checking will require a timestamp to bust cache to avoid browser cache error. You can set the `checkOrientation` option to `false` to cancel this request.

If the value of the image's `crossOrigin` attribute is `"use-credentials"`, then the `withCredentials` attribute will set to `true` when read the image data by XMLHttpRequest.

### checkOrientation

- Type: `Boolean`
- Default: `true`

Check the current image's Exif Orientation information. Note that only a JPEG image may contain Exif Orientation information.

Exactly, read the Orientation value for rotating or flipping the image, and then override the Orientation value with `1` (the default value) to avoid some issues ([1](https://github.com/fengyuanchen/cropper/issues/120), [2](https://github.com/fengyuanchen/cropper/issues/509)) on iOS devices.

Requires to set both the `rotatable` and `scalable` options to `true` at the same time.

**Note:** Do not trust this all the time as some JPG images may have incorrect (non-standard) Orientation values

> Requires [Typed Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) support ([IE 10+](https://caniuse.com/typedarrays)).

### modal

- Type: `Boolean`
- Default: `true`

Show the black modal above the image and under the crop box.

### guides

- Type: `Boolean`
- Default: `true`

Show the dashed lines above the crop box.

### center

- Type: `Boolean`
- Default: `true`

Show the center indicator above the crop box.

### highlight

- Type: `Boolean`
- Default: `true`

Show the white modal above the crop box (highlight the crop box).

### background

- Type: `Boolean`
- Default: `true`

Show the grid background of the container.

### autoCrop

- Type: `Boolean`
- Default: `true`

Enable to crop the image automatically when initialized.

### autoCropArea

- Type: `Number`
- Default: `0.8` (80% of the image)

It should be a number between 0 and 1. Define the automatic cropping area size (percentage).

### movable

- Type: `Boolean`
- Default: `true`

Enable to move the image.

### rotatable

- Type: `Boolean`
- Default: `true`

Enable to rotate the image.

### scalable

- Type: `Boolean
- Default: `true`

Enable to scale the image.

### zoomable

- Type: `Boolean`
- Default: `true`

Enable to zoom the image.

### zoomOnTouch

- Type: `Boolean`
- Default: `true`

Enable to zoom the image by dragging touch.

### zoomOnWheel

- Type: `Boolean`
- Default: `true`

Enable to zoom the image by mouse wheeling.

### wheelZoomRatio

- Type: `Number`
- Default: `0.1`

Define zoom ratio when zooming the image by mouse wheeling.

### cropBoxMovable

- Type: `Boolean`
- Default: `true`

Enable to move the crop box by dragging.

### cropBoxResizable

- Type: `Boolean`
- Default: `true`

Enable to resize the crop box by dragging.

### toggleDragModeOnDblclick

- Type: `Boolean`
- Default: `true`

Enable to toggle drag mode between `"crop"` and `"move"` when clicking twice on the cropper.

> Requires [`dblclick`](https://developer.mozilla.org/en-US/docs/Web/Events/dblclick) event support.

### minContainerWidth

- Type: `Number`
- Default: `200`

The minimum width of the container.

### minContainerHeight

- Type: `Number`
- Default: `100`

The minimum height of the container.

### minCanvasWidth

- Type: `Number`
- Default: `0`

The minimum width of the canvas (image wrapper).

### minCanvasHeight

- Type: `Number`
- Default: `0`

The minimum height of the canvas (image wrapper).

### minCropBoxWidth

- Type: `Number`
- Default: `0`

The minimum width of the crop box.

**Note:** This size is relative to the page, not the image.

### minCropBoxHeight

- Type: `Number`
- Default: `0`

The minimum height of the crop box.

**Note:** This size is relative to the page, not the image.

### ready

- Type: `Function`
- Default: `null`

A shortcut of the `ready` event.

### cropstart

- Type: `Function`
- Default: `null`

A shortcut of the `cropstart` event.

### cropmove

- Type: `Function`
- Default: `null`

A shortcut of the `cropmove` event.

### cropend

- Type: `Function`
- Default: `null`

A shortcut of the `cropend` event.

### crop

- Type: `Function`
- Default: `null`

A shortcut of the `crop` event.

### zoom

- Type: `Function`
- Default: `null`

A shortcut of the `zoom` event.

[⬆ back to top](#table-of-contents)

## Methods

As there is an **asynchronous** process when loading the image, you **should call most of the methods after ready**, except `setAspectRatio`, `replace` and `destroy`.

> If a method doesn't need to return any value, it will return the cropper instance (`this`) for chain composition.

```js
new Cropper(image, {
  ready() {
    // this.cropper[method](argument1, , argument2, ..., argumentN);
    this.cropper.move(1, -1);

    // Allows chain composition
    this.cropper.move(1, -1).rotate(45).scale(1, -1);
  },
});
```

### crop()

Show the crop box manually.

```js
new Cropper(image, {
  autoCrop: false,
  ready() {
    // Do something here
    // ...

    // And then
    this.cropper.crop();
  },
});
```

### reset()

Reset the image and crop box to their initial states.

### clear()

Clear the crop box.

### replace(url[, hasSameSize])

- **url**:
  - Type: `String`
  - A new image url.

- **hasSameSize** (optional):
  - Type: `Boolean`
  - Default: `false`
  - If the new image has the same size as the old one, then it will not rebuild the cropper and only update the URLs of all related images. This can be used for applying filters.

Replace the image's src and rebuild the cropper.

### enable()

Enable (unfreeze) the cropper.

### disable()

Disable (freeze) the cropper.

### destroy()

Destroy the cropper and remove the instance from the image.

### move(offsetX[, offsetY])

- **offsetX**:
  - Type: `Number`
  - Moving size (px) in the horizontal direction.

- **offsetY** (optional):
  - Type: `Number`
  - Moving size (px) in the vertical direction.
  - If not present, its default value is `offsetX`.

Move the canvas (image wrapper) with relative offsets.

```js
cropper.move(1);
cropper.move(1, 0);
cropper.move(0, -1);
```

### moveTo(x[, y])

- **x**:
  - Type: `Number`
  - The `left` value of the canvas

- **y** (optional):
  - Type: `Number`
  - The `top` value of the canvas
  - If not present, its default value is `x`.

Move the canvas (image wrapper) to an absolute point.

### zoom(ratio)

- **ratio**:
  - Type: `Number`
  - Zoom in: requires a positive number (ratio > 0)
  - Zoom out: requires a negative number (ratio < 0)

Zoom the canvas (image wrapper) with a relative ratio.

```js
cropper.zoom(0.1);
cropper.zoom(-0.1);
```

### zoomTo(ratio[, pivot])

- **ratio**:
  - Type: `Number`
  - Requires a positive number (ratio > 0)

- **pivot** (optional):
  - Type: `Object`
  - Schema: `{ x: Number, y: Number }`
  - The coordinate of the center point for zooming, base on the top left corner of the cropper container.

Zoom the canvas (image wrapper) to an absolute ratio.

```js
cropper.zoomTo(1); // 1:1 (canvasData.width === canvasData.naturalWidth)

const containerData = cropper.getContainerData();

// Zoom to 50% from the center of the container.
cropper.zoomTo(.5, {
  x: containerData.width / 2,
  y: containerData.height / 2,
});
```

### rotate(degree)

- **degree**:
  - Type: `Number`
  - Rotate right: requires a positive number (degree > 0)
  - Rotate left: requires a negative number (degree < 0)

Rotate the image with a relative degree.

> Requires [CSS3 2D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) support ([IE 9+](https://caniuse.com/transforms2d)).

```js
cropper.rotate(90);
cropper.rotate(-90);
```

### rotateTo(degree)

- **degree**:
  - Type: `Number`

Rotate the image to an absolute degree.

### scale(scaleX[, scaleY])

- **scaleX**:
  - Type: `Number`
  - Default: `1`
  - The scaling factor to apply to the abscissa of the image.
  - When equal to `1` it does nothing.

- **scaleY** (optional):
  - Type: `Number`
  - The scaling factor to apply on the ordinate of the image.
  - If not present, its default value is `scaleX`.

Scale the image.

> Requires [CSS3 2D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) support ([IE 9+](https://caniuse.com/transforms2d)).

```js
cropper.scale(-1); // Flip both horizontal and vertical
cropper.scale(-1, 1); // Flip horizontal
cropper.scale(1, -1); // Flip vertical
```

### scaleX(scaleX)

- **scaleX**:
  - Type: `Number`
  - Default: `1`
  - The scaling factor to apply to the abscissa of the image.
  - When equal to `1` it does nothing.

Scale the abscissa of the image.

### scaleY(scaleY)

- **scaleY**:
  - Type: `Number`
  - Default: `1`
  - The scaling factor to apply on the ordinate of the image.
  - When equal to `1` it does nothing.

Scale the ordinate of the image.

### getData([rounded])

- **rounded** (optional):
  - Type: `Boolean`
  - Default: `false`
  - Set `true` to get rounded values.

- (return value):
  - Type: `Object`
  - Properties:
    - `x`: the offset left of the cropped area
    - `y`: the offset top of the cropped area
    - `width`: the width of the cropped area
    - `height`: the height of the cropped area
    - `rotate`: the rotated degrees of the image
    - `scaleX`: the scaling factor to apply on the abscissa of the image
    - `scaleY`: the scaling factor to apply on the ordinate of the image

Output the final cropped area position and size data (base on the natural size of the original image).

> You can send the data to the server-side to crop the image directly:
>
> 1. Rotate the image with the `rotate` property.
> 2. Scale the image with the `scaleX` and `scaleY` properties.
> 3. Crop the image with the `x`, `y`, `width`, and `height` properties.

![A schematic diagram for data's properties](docs/images/data.jpg)

### setData(data)

- **data**:
  - Type: `Object`
  - Properties: See the [`getData`](#getdatarounded) method.
  - You may need to round the data properties before passing them in.

Change the cropped area position and size with new data (base on the original image).

> **Note:** This method only available when the value of the `viewMode` option is greater than or equal to `1`.

### getContainerData()

- (return  value):
  - Type: `Object`
  - Properties:
    - `width`: the current width of the container
    - `height`: the current height of the container

Output the container size data.

![A schematic diagram for cropper's layers](docs/images/layers.jpg)

### getImageData()

- (return  value):
  - Type: `Object`
  - Properties:
    - `left`: the offset left of the image
    - `top`: the offset top of the image
    - `width`: the width of the image
    - `height`: the height of the image
    - `naturalWidth`: the natural width of the image
    - `naturalHeight`: the natural height of the image
    - `aspectRatio`: the aspect ratio of the image
    - `rotate`: the rotated degrees of the image if it is rotated
    - `scaleX`: the scaling factor to apply on the abscissa of the image if scaled
    - `scaleY`: the scaling factor to apply on the ordinate of the image if scaled

Output the image position, size, and other related data.

### getCanvasData()

- (return  value):
  - Type: `Object`
  - Properties:
    - `left`: the offset left of the canvas
    - `top`: the offset top of the canvas
    - `width`: the width of the canvas
    - `height`: the height of the canvas
    - `naturalWidth`: the natural width of the canvas (read only)
    - `naturalHeight`: the natural height of the canvas (read only)

Output the canvas (image wrapper) position and size data.

```js
const imageData = cropper.getImageData();
const canvasData = cropper.getCanvasData();

if (imageData.rotate % 180 === 0) {
  console.log(canvasData.naturalWidth === imageData.naturalWidth);
  // > true
}
```

### setCanvasData(data)

- **data**:
  - Type: `Object`
  - Properties:
    - `left`: the new offset left of the canvas
    - `top`: the new offset top of the canvas
    - `width`: the new width of the canvas
    - `height`: the new height of the canvas

Change the canvas (image wrapper) position and size with new data.

### getCropBoxData()

- (return  value):
  - Type: `Object`
  - Properties:
    - `left`: the offset left of the crop box
    - `top`: the offset top of the crop box
    - `width`: the width of the crop box
    - `height`: the height of the crop box

Output the crop box position and size data.

### setCropBoxData(data)

- **data**:
  - Type: `Object`
  - Properties:
    - `left`: the new offset left of the crop box
    - `top`: the new offset top of the crop box
    - `width`: the new width of the crop box
    - `height`: the new height of the crop box

Change the crop box position and size with new data.

### getCroppedCanvas([options])

- **options** (optional):
  - Type: `Object`
  - Properties:
    - `width`: the destination width of the output canvas.
    - `height`: the destination height of the output canvas.
    - `minWidth`: the minimum destination width of the output canvas, the default value is `0`.
    - `minHeight`: the minimum destination height of the output canvas, the default value is `0`.
    - `maxWidth`: the maximum destination width of the output canvas, the default value is `Infinity`.
    - `maxHeight`: the maximum destination height of the output canvas, the default value is `Infinity`.
    - `fillColor`: a color to fill any alpha values in the output canvas, the default value is the `transparent`.
    - [`imageSmoothingEnabled`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled): set to change if images are smoothed (`true`, default) or not (`false`).
    - [`imageSmoothingQuality`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality): set the quality of image smoothing, one of "low" (default), "medium", or "high".

- (return  value):
  - Type: `HTMLCanvasElement`
  - A canvas drawn the cropped image.

- Notes:
  - The aspect ratio of the output canvas will be fitted to the aspect ratio of the crop box automatically.
  - If you intend to get a JPEG image from the output canvas, you should set the `fillColor` option first, if not, the transparent part in the JPEG image will become black by default.
  - Uses the Browser's native [canvas.toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) API to do the compression work, which means it is **lossy compression**. For better image quality, you can upload the original image and the cropped data to a server and do the crop work on the server.

- Browser support:
  - Basic image: requires [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement) support ([IE 9+](https://caniuse.com/canvas)).
  - Rotated image: requires [CSS3 2D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) support ([IE 9+](https://caniuse.com/transforms2d)).
  - Cross-origin image: requires HTML5 [CORS settings attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes) support ([IE 11+](https://caniuse.com/cors)).

Get a canvas drawn the cropped image (lossy compression). If it is not cropped, then returns a canvas drawn the whole image.

> After then, you can display the canvas as an image directly, or use [HTMLCanvasElement.toDataURL](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) to get a Data URL, or use [HTMLCanvasElement.toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) to get a blob and upload it to server with [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) if the browser supports these APIs.

Avoid get a blank (or black) output image, you might need to set the `maxWidth` and `maxHeight` properties to limited numbers, because of [the size limits of a canvas element](https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element). Also, you should limit the maximum zoom ratio (in the `zoom` event) for the same reason.

```js
cropper.getCroppedCanvas();

cropper.getCroppedCanvas({
  width: 160,
  height: 90,
  minWidth: 256,
  minHeight: 256,
  maxWidth: 4096,
  maxHeight: 4096,
  fillColor: '#fff',
  imageSmoothingEnabled: false,
  imageSmoothingQuality: 'high',
});

// Upload cropped image to server if the browser supports `HTMLCanvasElement.toBlob`.
// The default value for the second parameter of `toBlob` is 'image/png', change it if necessary.
cropper.getCroppedCanvas().toBlob((blob) => {
  const formData = new FormData();

  // Pass the image file name as the third parameter if necessary.
  formData.append('croppedImage', blob/*, 'example.png' */);

  // Use `jQuery.ajax` method for example
  $.ajax('/path/to/upload', {
    method: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success() {
      console.log('Upload success');
    },
    error() {
      console.log('Upload error');
    },
  });
}/*, 'image/png' */);
```

### setAspectRatio(aspectRatio)

- **aspectRatio**:
  - Type: `Number`
  - Requires a positive number.

Change the aspect ratio of the crop box.

### setDragMode([mode])

- **mode** (optional):
  - Type: `String`
  - Default: `'none'`
  - Options: `'none'`, `'crop'`, `'move'`

Change the drag mode.

**Tips:** You can toggle the "crop" and "move" mode by double click on the cropper.

[⬆ back to top](#table-of-contents)

## Events

### ready

This event fires when the target image has been loaded and the cropper instance is ready for operating.

```js
let cropper;

image.addEventListener('ready', function () {
  console.log(this.cropper === cropper);
  // > true
});

cropper = new Cropper(image);
```

### cropstart

- **event.detail.originalEvent**:
  - Type: `Event`
  - Options: `pointerdown`, `touchstart`, and `mousedown`

- **event.detail.action**:
  - Type: `String`
  - Options:
    - `'crop'`: create a new crop box
    - `'move'`: move the canvas (image wrapper)
    - `'zoom'`: zoom in / out the canvas (image wrapper) by touch.
    - `'e'`: resize the east side of the crop box
    - `'w'`: resize the west side of the crop box
    - `'s'`: resize the south side of the crop box
    - `'n'`: resize the north side of the crop box
    - `'se'`: resize the southeast side of the crop box
    - `'sw'`: resize the southwest side of the crop box
    - `'ne'`: resize the northeast side of the crop box
    - `'nw'`: resize the northwest side of the crop box
    - `'all'`: move the crop box (all directions)

This event fires when the canvas (image wrapper) or the crop box starts to change.

```js
image.addEventListener('cropstart', (event) => {
  console.log(event.detail.originalEvent);
  console.log(event.detail.action);
});
```

### cropmove

- **event.detail.originalEvent**:
  - Type: `Event`
  - Options: `pointermove`, `touchmove`, and `mousemove`.

- **event.detail.action**: the same as "cropstart".

This event fires when the canvas (image wrapper) or the crop box is changing.

### cropend

- **event.detail.originalEvent**:
  - Type: `Event`
  - Options: `pointerup`, `pointercancel`, `touchend`, `touchcancel`, and `mouseup`.

- **event.detail.action**: the same as "cropstart".

This event fires when the canvas (image wrapper) or the crop box stops to change.

### crop

- **event.detail.x**
- **event.detail.y**
- **event.detail.width**
- **event.detail.height**
- **event.detail.rotate**
- **event.detail.scaleX**
- **event.detail.scaleY**

> About these properties, see the [`getData`](#getdatarounded) method.

This event fires when the canvas (image wrapper) or the crop box changed.

**Notes:**

- When the `autoCrop` option is set to the `true`, a `crop` event will be triggered before the `ready` event.
- When the `data` option is set, another `crop` event will be triggered before the `ready` event.

### zoom

- **event.detail.originalEvent**:
  - Type: `Event`
  - Options: `wheel`, `pointermove`, `touchmove`, and `mousemove`.

- **event.detail.oldRatio**:
  - Type: `Number`
  - The old (current) ratio of the canvas

- **event.detail.ratio**:
  - Type: `Number`
  - The new (next) ratio of the canvas (`canvasData.width / canvasData.naturalWidth`)

This event fires when a cropper instance starts to zoom in or zoom out its canvas (image wrapper).

```js
image.addEventListener('zoom', (event) => {
  // Zoom in
  if (event.detail.ratio > event.detail.oldRatio) {
    event.preventDefault(); // Prevent zoom in
  }

  // Zoom out
  // ...
});
```

[⬆ back to top](#table-of-contents)

## No conflict

If you have to use another cropper with the same namespace, just call the `Cropper.noConflict` static method to revert to it.

```html
<script src="other-cropper.js"></script>
<script src="cropper.js"></script>
<script>
  Cropper.noConflict();
  // Code that uses other `Cropper` can follow here.
</script>
```

## Browser support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)
- Edge (latest)
- Internet Explorer 9+

## Contributing

Please read through our [contributing guidelines](.github/CONTRIBUTING.md).

## Versioning

Maintained under the [Semantic Versioning guidelines](https://semver.org/).

## License

[MIT](https://opensource.org/licenses/MIT) © [Chen Fengyuan](https://chenfengyuan.com/)

## Related projects

- [angular-cropperjs](https://github.com/matheusdavidson/angular-cropperjs) by @matheusdavidson
- [ember-cropperjs](https://github.com/danielthall/ember-cropperjs) by @danielthall
- [iron-cropper](https://github.com/safetychanger/iron-cropper) by @safetychanger
- [react-cropper](https://github.com/react-cropper/react-cropper) by @roadmanfong
- [vue-cropperjs](https://github.com/Agontuk/vue-cropperjs) by @Agontuk

[⬆ back to top](#table-of-contents)

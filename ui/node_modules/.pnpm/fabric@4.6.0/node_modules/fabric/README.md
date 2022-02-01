## Fabric.js

<!-- build/coverage status, climate -->

[![Build Status](https://secure.travis-ci.org/fabricjs/fabric.js.svg?branch=master)](http://travis-ci.org/#!/kangax/fabric.js)
[![Code Climate](https://d3s6mut3hikguw.cloudfront.net/github/kangax/fabric.js/badges/gpa.svg)](https://codeclimate.com/github/kangax/fabric.js)
[![Coverage Status](https://coveralls.io/repos/fabricjs/fabric.js/badge.png?branch=master)](https://coveralls.io/r/kangax/fabric.js?branch=master)
[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/fabricjs/fabric.js)

<!-- npm, bower, CDNJS versions, downloads -->

[![Bower version](https://badge.fury.io/bo/fabric.svg)](http://badge.fury.io/bo/fabric)
[![NPM version](https://badge.fury.io/js/fabric.svg)](http://badge.fury.io/js/fabric)
[![Downloads per month](https://img.shields.io/npm/dm/fabric.svg)](https://www.npmjs.org/package/fabric)
[![CDNJS version](https://img.shields.io/cdnjs/v/fabric.js.svg)](https://cdnjs.com/libraries/fabric.js)

<!-- deps status -->

[![Dependency Status](https://david-dm.org/kangax/fabric.js.svg?theme=shields.io)](https://david-dm.org/kangax/fabric.js)
[![devDependency Status](https://david-dm.org/kangax/fabric.js/dev-status.svg?theme=shields.io)](https://david-dm.org/kangax/fabric.js#info=devDependencies)

<!-- bounties, tips -->

[![Bountysource](https://api.bountysource.com/badge/tracker?tracker_id=23217)](https://www.bountysource.com/trackers/23217-fabric-js?utm_source=23217&utm_medium=shield&utm_campaign=TRACKER_BADGE)
[![Flattr this git repo](http://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=kangax&url=http://github.com/kangax/fabric.js&title=Fabric.js&language=&tags=github&category=software)

**Fabric.js** is a framework that makes it easy to work with HTML5 canvas element. It is an **interactive object model** on top of canvas element. It is also an **SVG-to-canvas parser**.

<a href="http://fabricjs.com/kitchensink" target="_blank"><img src="https://github.com/kangax/fabric.js/raw/master/lib/screenshot.png" style="width:300px;box-shadow:rgba(0,0,0,0.3) 0 0 5px"></a>

Using Fabric.js, you can create and populate objects on canvas; objects like simple geometrical shapes — rectangles, circles, ellipses, polygons, or more complex shapes consisting of hundreds or thousands of simple paths. You can then scale, move, and rotate these objects with the mouse; modify their properties — color, transparency, z-index, etc. You can also manipulate these objects altogether — grouping them with a simple mouse selection.

### Non-Technical Introduction to Fabric

Fabric.js allows you to easily create simple shapes like rectangles, circles, triangles and other polygons or more complex shapes made up of many paths, onto the HTML `<canvas>` element on a webpage using JavaScript.  Fabric.js will then allow you to manipulate the size, position and rotation of these objects with a mouse.  It’s also possible to change some of the attributes of these objects such as their color, transparency, depth position on the webpage or selecting groups of these objects using the Fabric.js library. Fabric.js will also allow you to convert an SVG image into JavaScript data that can be used for putting it onto the `<canvas>` element.


[Contributions](https://github.com/kangax/fabric.js/wiki/Love-Fabric%3F-Help-us-by...) are very much welcome!

### Goals

- Unit tested (1150+ tests at the moment, 79%+ coverage)
- Modular (~60 small ["classes", modules, mixins](http://fabricjs.com/docs/))
- Cross-browser
- [Fast](https://github.com/kangax/fabric.js/wiki/Focus-on-speed)
- Encapsulated in one object
- No browser sniffing for critical functionality
- Runs under ES5 strict mode
- Runs on a server under [Node.js](http://nodejs.org/) (active stable releases and latest of current) (see [Node.js limitations](https://github.com/kangax/fabric.js/wiki/Fabric-limitations-in-node.js))
- Follows [Semantic Versioning](http://semver.org/)

### Supported browsers

- Firefox 4+
- Safari 5+
- Opera 9.64+
- Chrome (all versions)
- Edge (chromium based, all versions)
- IE11 and Edge legacy, supported but deprecated.

You can [run automated unit tests](http://fabricjs.com/test/unit/) right in the browser.

### History

Fabric.js started as a foundation for design editor on [printio.ru](http://printio.ru) — interactive online store with ability to create your own designs. The idea was to create [Javascript-based editor](http://printio.ru/ringer_man_tees/new), which would make it easy to manipulate vector shapes and images on T-Shirts. Since performance was one of the most critical requirements, we chose canvas over SVG. While SVG is excellent with static shapes, it's not as performant as canvas when it comes to dynamic manipulation of objects (movement, scaling, rotation, etc.). Fabric.js was heavily inspired by [Ernest Delgado's canvas experiment](http://www.ernestdelgado.com/public-tests/canvasphoto/demo/canvas.html). In fact, code from Ernest's experiment was the foundation of an entire framework. Later, Fabric.js grew into a collection of distinct object types and got an SVG-to-canvas parser.

### Installation Instructions

<h3 id="bower-install">Install with bower</h3>

    $ bower install fabric

<h3 id="npm-install">Install with npm</h3>

Note: If you are using Fabric.js in a Node.js script, you will depend from [node-canvas](https://github.com/Automattic/node-canvas).`node-canvas` is an html canvas replacement that works on top of native libraries.
Please follow the instructions located [here](https://github.com/Automattic/node-canvas#compiling) in order to get it up and running.


    $ npm install fabric --save


After this, you can import fabric like so:

```
const fabric = require("fabric").fabric;
```

Or you can use this instead if your build pipeline supports ES6 imports:

```
import { fabric } from "fabric";
```

NOTE: es6 imports won't work in browser or with bundlers which expect es6 module like vite. Use commonjs syntax instead.

See [the example section](#examples-of-use) for usage examples.

<h3 id="fabric-building">Building</h3>

1. [Install Node.js](https://github.com/joyent/node/wiki/Installation)

2. Build distribution file  **[~77K minified, ~20K gzipped]**

        $ node build.js

    2.1 Or build a custom distribution file, by passing (comma separated) module names to be included.

          $ node build.js modules=text,serialization,parser
          // or
          $ node build.js modules=text
          // or
          $ node build.js modules=parser,text
          // etc.

      By default (when none of the modules are specified) only basic functionality is included.
      See the list of modules below for more information on each one of them.
      Note that default distribution has support for **static canvases** only.

      To get minimal distribution with interactivity, make sure to include corresponding module:

          $ node build.js modules=interaction

    2.2 You can also include all modules like so:

          $ node build.js modules=ALL

    2.3 You can exclude a few modules like so:

          $ node build.js modules=ALL exclude=gestures,image_filters

3. Create a minified distribution file

        # Using YUICompressor (default option)
        $ node build.js modules=... minifier=yui

        # or Google Closure Compiler
        $ node build.js modules=... minifier=closure

4. Enable AMD support via require.js (requires uglify)

        $ node build.js requirejs modules=...

5. Create source map file for better productive debugging (requires uglify or google closure compiler).<br>More information about [source maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/).

        $ node build.js sourcemap modules=...

    If you use google closure compiler you have to add `sourceMappingURL` manually at the end of the minified file all.min.js (see issue https://code.google.com/p/closure-compiler/issues/detail?id=941).

        //# sourceMappingURL=fabric.min.js.map

6. Ensure code guidelines are met (prerequisite: `npm -g install eslint`)

        $ npm run lint && npm run lint_tests

<h3 id="fabric-building">Testing</h3>

1. [Install Node.js](https://github.com/joyent/node/wiki/Installation)

2. [Install NPM, if necessary](https://github.com/npm/npm#super-easy-install)

3. Install NPM packages

        $ npm install

4. Run test suite

Make sure testem is installed

        $ npm install -g testem

Run tests Chrome and Node (by default):

        $ testem

See testem docs for more info: https://github.com/testem/testem

### Demos

- [Demos](http://fabricjs.com/demos/)
- [Kitchensink demo](http://fabricjs.com/kitchensink)
- [Benchmarks](http://fabricjs.com/benchmarks/)

[Who's using Fabric?](http://trends.builtwith.com/javascript/FabricJS)

### Documentation

Documentation is always available at [http://fabricjs.com/docs/](http://fabricjs.com/docs/).

Also see [official 4-part intro series](http://fabricjs.com/articles), [presentation from BK.js](http://www.slideshare.net/kangax/fabricjs-building-acanvaslibrarybk) and [presentation from Falsy Values](http://www.slideshare.net/kangax/fabric-falsy-values-8067834) for an overview of fabric.js, how it works, and its features.

### Optional modules

These are the optional modules that could be specified for inclusion, when building custom version of fabric:

- **text** — Adds support for static text (`fabric.Text`)
- **itext** — Adds support for interactive text (`fabric.IText`, `fabric.Textbox`)
- **serialization** — Adds support for `loadFromJSON`, `loadFromDatalessJSON`, and `clone` methods on `fabric.Canvas`
- **interaction** — Adds support for interactive features of fabric — selecting/transforming objects/groups via mouse/touch devices.
- **parser** — Adds support for `fabric.parseSVGDocument`, `fabric.loadSVGFromURL`, and `fabric.loadSVGFromString`
- **image_filters** — Adds support for image filters, such as grayscale of white removal.
- **easing** — Adds support for animation easing functions
- **node** — Adds support for running fabric under node.js, with help of [jsdom](https://github.com/tmpvar/jsdom) and [node-canvas](https://github.com/learnboost/node-canvas) libraries.
- **freedrawing** — Adds support for free drawing
- **erasing** — Adds support for object erasing using an eraser brush
- **gestures** — Adds support for multitouch gestures with help of [Event.js](https://github.com/mudcube/Event.js)
- **object_straightening** — Adds support for rotating an object to one of 0, 90, 180, 270, etc. depending on which is angle is closer.
- **animation** — Adds support for animation (`fabric.util.animate`, `fabric.util.requestAnimFrame`, `fabric.Object#animate`, `fabric.Canvas#fxCenterObjectH/#fxCenterObjectV/#fxRemove`)

Additional flags for build script are:

- **requirejs** — Makes fabric requirejs AMD-compatible in `dist/fabric.js`. *Note:* an unminified, requirejs-compatible version is always created in `dist/fabric.require.js`
- **no-strict** — Strips "use strict" directives from source
- **no-svg-export** — Removes svg exporting functionality
- **sourcemap** - Generates a sourceMap file and adds the `sourceMappingURL` (only if uglifyjs is used) to `dist/fabric.min.js`

For example:

    node build.js modules=ALL exclude=json no-strict no-svg-export

### Examples of use

#### Adding red rectangle to canvas

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
    <canvas id="canvas" width="300" height="300"></canvas>

    <script src="lib/fabric.js"></script>
    <script>
        var canvas = new fabric.Canvas('canvas');

        var rect = new fabric.Rect({
            top : 100,
            left : 100,
            width : 60,
            height : 70,
            fill : 'red'
        });

        canvas.add(rect);
    </script>
</body>
</html>
```

### Helping Fabric

- [Fabric on Bountysource](https://www.bountysource.com/trackers/23217-fabric-js)
- [Fabric on CodeTriage](http://www.codetriage.com/kangax/fabric.js)
- [Contributing](./CONTRIBUTING.md)

### Staying in touch

Follow [@fabric.js](http://twitter.com/fabricjs), [@kangax](http://twitter.com/kangax) or [@AndreaBogazzi](http://twitter.com/AndreaBogazzi) on twitter.

Questions, suggestions — [fabric.js on Google Groups](http://groups.google.com/group/fabricjs).

See [Fabric questions on Stackoverflow](http://stackoverflow.com/questions/tagged/fabricjs),
Fabric snippets on [jsfiddle](http://jsfiddle.net/user/fabricjs/fiddles/)
or [codepen.io](http://codepen.io/tag/fabricjs).

Fabric on [LibKnot](http://libknot.ohmztech.com/).

Get help in Fabric's IRC channel — irc://irc.freenode.net/#fabric.js

### Credits

- [Andrea Bogazzi](https://twitter.com/AndreaBogazzi) for help with bugs, new features, documentation, GitHub issues
- Ernest Delgado for the original idea of [manipulating images on canvas](http://www.ernestdelgado.com/archive/canvas/)
- [Maxim "hakunin" Chernyak](http://twitter.com/hakunin) for ideas, and help with various parts of the library throughout its life
- [Sergey Nisnevich](http://nisnya.com) for help with geometry logic
- [Stefan Kienzle](https://twitter.com/kienzle_s) for help with bugs, features, documentation, GitHub issues
- [Shutterstock](http://www.shutterstock.com/jobs) for the time and resources invested in using and improving fabric.js
- [And all the other GitHub contributors](https://github.com/kangax/fabric.js/graphs/contributors)

### MIT License

Copyright (c) 2008-2015 Printio (Juriy Zaytsev, Maxim Chernyak)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

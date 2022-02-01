# ![Toast UI ImageEditor](https://user-images.githubusercontent.com/35218826/40895380-0b9f4cd6-67ea-11e8-982f-18121daa3a04.png)

> Full featured image editor using HTML5 Canvas. It's easy to use and provides powerful filters.

[![npm version](https://img.shields.io/npm/v/tui-image-editor.svg)](https://www.npmjs.com/package/tui-image-editor)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#Collect-statistics-on-the-use-of-open-source)
- [Install](#-install)
  - [Via Package Manager](#via-package-manager)
  - [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
  - [Download Source Files](#download-source-files)
- [Usage](#-usage)
  - [HTML](#html)
  - [JavaScript](#javascript)
  - [Menu svg icon setting](#menu-svg-icon-setting)
  - [TypeScript](#typescript)

## Collect statistics on the use of open source

TOAST UI ImageEditor applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI ImageEditor is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` option when creating the instance.

```js
const options = {
  //...
  usageStatistics: false,
};

const imageEditor = new tui.ImageEditor('#tui-image-editor-container', options);
```

Or, include [`tui-code-snippet`](https://github.com/nhn/tui.code-snippet)(**v1.4.0** or **later**) and then immediately write the options as follows:

```js
tui.usageStatistics = false;
```

## 💾 Install

The TOAST UI products can be installed by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

You can find TOAST UI products via [npm](https://www.npmjs.com/) and [bower](https://bower.io/) package managers.
Install by using the commands provided by each package manager.
When using npm, be sure [Node.js](https://nodejs.org) is installed in the environment.

#### npm

##### 1. ImageEditor installation

```sh
$ npm install --save tui-image-editor # Latest version
$ npm install --save tui-image-editor@<version> # Specific version
```

##### 2. If the installation of the `fabric.js` dependency module does not go smoothly

To solve the problem, you need to refer to [Some Steps](https://github.com/fabricjs/fabric.js#install-with-npm) to solve the problem.

#### bower

```sh
$ bower install tui-image-editor # Latest version
$ bower install tui-image-editor#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)

TOAST UI products are available over the CDN powered by [NHN Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<link
  rel="stylesheet"
  href="https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.css"
/>
<script src="https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the URL.

The CDN directory has the following structure.

```
tui-image-editor/
├─ latest/
│  ├─ tui-image-editor.js
│  ├─ tui-image-editor.min.js
│  └─ tui-image-editor.css
├─ v3.1.0/
│  ├─ ...
```

### Download Source Files

- [Download bundle files from `dist` folder](https://github.com/nhn/tui.image-editor/tree/production/dist)
- [Download all sources for each version](https://github.com/nhn/tui.image-editor/releases)

## 🔨 Usage

### HTML

Add the container element where TOAST UI ImageEditor will be created.

```html
<body>
  ...
  <div id="tui-image-editor"></div>
  ...
</body>
```

### javascript

Add dependencies & initialize ImageEditor class with given element to make an image editor.

```javascript
const ImageEditor = require('tui-image-editor');
const FileSaver = require('file-saver'); //to download edited image to local. Use after npm install file-saver
const blackTheme = require('./js/theme/black-theme.js');
const locale_ru_RU = {
  // override default English locale to your custom
  Crop: 'Обзрезать',
  'Delete-all': 'Удалить всё',
  // etc...
};
const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
  includeUI: {
    loadImage: {
      path: 'img/sampleImage.jpg',
      name: 'SampleImage',
    },
    locale: locale_ru_RU,
    theme: blackTheme, // or whiteTheme
    initMenu: 'filter',
    menuBarPosition: 'bottom',
  },
  cssMaxWidth: 700,
  cssMaxHeight: 500,
  selectionStyle: {
    cornerSize: 20,
    rotatingPointOffset: 70,
  },
});
```

Or

```javascript
const ImageEditor = require('tui-image-editor');
const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
  cssMaxWidth: 700,
  cssMaxHeight: 500,
  selectionStyle: {
    cornerSize: 20,
    rotatingPointOffset: 70,
  },
});
```

### Menu svg icon setting

#### There are two ways to set icons.

1. **Use default svg built** into imageEditor without setting svg file path (Features added since version v3.9.0).
2. There is a way to use the **actual physical svg file** and **set the file location manually**.

Can find more details in [this document](https://github.com/nhn/tui.image-editor/blob/master/docs/Basic-Tutorial.md#4-menu-submenu-svg-icon-setting).

### TypeScript

If you use TypeScript, You must `import module = require('module')` on importing.
[`export =` and `import = require()`](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require)

```typescript
import ImageEditor = require('tui-image-editor');
const FileSaver = require('file-saver'); //to download edited image to local. Use after npm install file-saver

const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
  cssMaxWidth: 700,
  cssMaxHeight: 500,
  selectionStyle: {
    cornerSize: 20,
    rotatingPointOffset: 70,
  },
});
```

See [details](https://nhn.github.io/tui.image-editor/latest) for additional information.

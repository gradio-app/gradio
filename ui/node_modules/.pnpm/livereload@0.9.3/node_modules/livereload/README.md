node-livereload
===============

![Build status](https://travis-ci.org/napcs/node-livereload.svg?branch=master)

An implementation of the LiveReload server in Node.js. It's an alternative to the graphical [http://livereload.com/](http://livereload.com/) application, which monitors files for changes and reloads your web browser.

## Usage

You can use this by using the official browser extension or by adding JavaScript code to your page.

## Method 1: Use Browser Extension

Install the LiveReload browser plugins by visiting [http://help.livereload.com/kb/general-use/browser-extensions](http://help.livereload.com/kb/general-use/browser-extensions).

**Note**: Only Google Chrome supports viewing `file:///` URLS, and you have to specifically enable it. If you are using other browsers and want to use `file:///` URLs, add the JS code to the page as shown in the next section.

Once you have the plugin installed, start `livereload`. Then, in the browser, click the LiveReload icon to connect the browser to the server.

### Method 2: Add code to page

Add this code:

```html
<script>
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>')
</script>
```

Note: If you are using a different port other than `35729` you will
need to change the above script.

## Running LiveReload

You can run LiveReload two ways: using the CLI application or by writing your own server using the API.

### Method 1: Using the Command line Interface

To use livereload from the command line:

```sh
$ npm install -g livereload
$ livereload [path] [options]
```

To watch files in the current directory for changes and use the default extensions, run this command:

```sh
$ livereload
```

To watch files in another directory, specify its path:

```sh
$ livereload ~/website
```

The commandline options are

* `-p` or `--port` to specify the listening port
* `-d` or `--debug` to show debug messages when the browser reloads.
* `-e` or `--exts` to specify extentions that you want to observe. Example: ` -e 'jade,scss'`. Removes the default extensions.
* `-ee` or `--extraExts` to include additional extentions that you want to observe. Example: ` -ee 'jade,scss'`.
* `-x` or `--exclusions` to specify additional exclusion patterns. Example: `-x html, images/`.
* `-u` or `--usepolling` to poll for file system changes. Set this to true to successfully watch files over a network.
* `-w` or `--wait` to add a delay (in miliseconds) between when livereload detects a change to the filesystem and when it notifies the browser.
* `-op` or `--originalpath` to set a URL you use for development, e.g 'http:/domain.com', then LiveReload will proxy this url to local path.

For example, to use a wait time and turn on debugging so you can see messages in your terminal, execute `livereload` like this:

```sh
$ livereload -w 1000 -d
```

To turn on debugging and tell Livereload to only look at HTML files in the `public` directory, run it like this:

```sh
$ livereload public/ -e 'html'
```

The file path can be at any place in the arguments. For example, you can put it at the end if you wish:

```sh
$ livereload -e 'html' public/
```

Finally, you can tell LiveReload to refresh the browser when specific filenames change. This is useful when there are files that don't have extensions, or when you want to exclude all HTML files except for `index.html` throughout the project. Use the `-f` or `--filesToReload` option:

```sh
$ livereload -f 'index.html' public/
```

All changes to `index.html` in any subdirectory will cause LiveReload to send the reload message.

## Option 2: From within your own project

To use the api within a project:

```sh
$ npm install livereload --save
```

Then, create a server and fire it up.

```js
var livereload = require('livereload');
var server = livereload.createServer();
server.watch(__dirname + "/public");
```

You can also use this with a Connect server. Here's an example of a simple server
using `connect` and a few other modules just to give you an idea:

```js
var connect  = require('connect');
var compiler = require('connect-compiler');
var static = require('serve-static');

var server = connect();

server.use(
  compiler({
      enabled : [ 'coffee', 'uglify' ],
      src     : 'src',
      dest    : 'public'
  })
);

server.use(  static(__dirname + '/public'));

server.listen(3000);

var livereload = require('livereload');
var lrserver = livereload.createServer();
lrserver.watch(__dirname + "/public");
```

You can then start up the server which will listen on port `3000`.

### Server API

The `createServer()` method accepts two arguments.

The first are some configuration options, passed as a JavaScript object:

* `https` is an optional object of options to be passed to [https.createServer](http://nodejs.org/api/https.html#https_https_createserver_options_requestlistener) (if not provided, `http.createServer` is used instead)
* `port` is the listening port. It defaults to `35729` which is what the LiveReload extensions use currently.
* `exts` is an array of extensions you want to observe. This overrides the default extensions of `[`html`, `css`, `js`, `png`, `gif`, `jpg`, `php`, `php5`, `py`, `rb`,  `erb`, `coffee`]`.
* `extraExts` is an array of extensions you want to observe. The default extensions are `[`html`, `css`, `js`, `png`, `gif`, `jpg`, `php`, `php5`, `py`, `rb`,  `erb`, `coffee`]`.
* `applyCSSLive` tells LiveReload to reload CSS files in the background instead of refreshing the page. The default for this is `true`.
* `applyImgLive` tells LiveReload to reload image files in the background instead of refreshing the page. The default for this is `true`. Namely for these extensions: jpg, jpeg, png, gif
* `exclusions` lets you specify files to ignore. By default, this includes `.git/`, `.svn/`, and `.hg/`
* `originalPath` Set URL you use for development, e.g 'http:/domain.com', then LiveReload will proxy this url to local path.
* `overrideURL` lets you specify a different host for CSS files. This lets you edit local CSS files but view a live site. See <http://feedback.livereload.com/knowledgebase/articles/86220-preview-css-changes-against-a-live-site-then-uplo> for details.
* `usePolling` Poll for file system changes. Set this to `true` to successfully watch files over a network.
* `delay` add a delay (in miliseconds) between when livereload detects a change to the filesystem and when it notifies the browser. Useful if the browser is reloading/refreshing before a file has been compiled, for example, by browserify.
* `noListen` Pass as `true` to indicate that the websocket server should not be started automatically. (useful if you want to start it yourself later)

The second argument is an optional `callback` that will be sent to the LiveReload server and called for the `listening` event. (ie: when the server is ready to start accepting connections)

## Watching multiple paths:

Passing an array of paths or glob patterns will allow you to watch multiple directories. All directories have the same configuration options.

```js
server.watch([__dirname + "/js", __dirname + "/css"]);
```

Command line:

```sh
$ livereload "path1, path2, path3"
```

## Using the `originalPath` option

You can map local CSS files to a remote URL. If your HTML file specifies live CSS files at `example.com` like this:

```html
<!-- html -->
<head>
  <link rel="stylesheet" href="http://domain.com/css/style.css">
</head>
```

Then you can tell livereload to substitute a local CSS file instead:

```js
// server.js
var server = livereload.createServer({
    originalPath: "http://domain.com"
});
server.watch('/User/Workspace/test');
```

Then run the server:

```sh
$ node server.js
```

When `/User/Workspace/test/css/style.css` is modified, the stylesheet will be reloaded on the page.

# Troubleshooting

## The browser extension doesn't connect.

If you're using `file:///` urls, make sure the browser extension is configured to access local files.  Alternatively, embed the `livereload.js` script on your page as shown in this README. 

## When I change the HTML page I'm working on, the browser refreshes and tells me the file isn't found.

Your editor is most likely using a swapfile, and when you save, there's a split second where the existing file is deleted from the file system before the swap file is saved in its place. This happens with Vim. You can disable swapfiles in your editor, or you can add a slight delay to Livereload using the `-w` option on the command line.



# Developing livereload

This library is implemented in CoffeeScript 1.x. It may eventually be converted to JavaScript, but because there are many projects that depend on this library, the conversion isn't a priority.

To build the distributable versions, run `npm run build`.

Run `npm test` to run the test suite.

# Contributing

Contributions welcome, but remember that this library is meant to be small and serve its intended purpose only. Before submitting a pull request, open a new issue to discuss your feature or bug. Please check all open and closed issues.

When submitting code, please keep commits small, and do not modify the README file. Commit both the Coffee and JS files.

# Changelog

### 0.9.3
* CLI: Fix multiple path parsing bug.

### 0.9.2
* Server: Added `filesToReload` option to specify a list of filenames that should trigger the reload, rather than relying on extensions alone.
* CLI: You can use the `-f` or `--filesToReload` option with the command line tool to specifiy filenames that should trigger a reload.
* CLI: The file path is no longer fixed to a specific position in the arguments list
* CLI: You no longer need to specify the file path when using additional arguments
* CLI: You can use the `-op` or `--originalpath` option with the command line tool instead of writing your own server.
* CLI: The help screen displays more accurate option descriptions.
* Tests: Added more specific tests to ensure that refresh is called in various scenarios.
* Other: Removed `Cakefile` as Cake is no longer needed. Use `npm run tests` and `npm run build` instead.
* Dependencies: Updated `chokidar` dependency to 3.5.1
* Dependencies: Updated `livereload-js` dependency to 3.3.1
* Dependencies: Updated `ws` dependency to 7.4.3

### 0.9.1
* Fix issue with livereload.js not resolving properly on some projects (caseywebdev)
* Update license to newer style to suppress "no license" messages.
* Update test scripts to handle compilers properly, suppressing the deprecation notice
* Deprecating the `cake` tasks for building the project.


### 0.9.0
* Serve Livereload client library from an NPM dependency instead of copying the code into the project - smhg
* Update Chokidar to 3.3.0 which improves performance and reduces CPU load.

### 0.8.2
* Fix regression in 0.8.1 where broadcasting failed due to incompatibility between arrays and sets
* Add debug message when broadcasting to each socket
* Add debug message for the `input` message from clients

### 0.8.1
* Update `ws` dependency to v6.2.1 to close security vulnerability

### 0.8.0
* Update bundled Livereload.js file to v3.0.0
* Update deps to close security vulnerabilities

### 0.7.0
* Updates bundled Livereload.js file to v2.3.0 to fix console error.
* BREAKING CHANGE: The `exts` and `e` options now **replace** the default extensions.
* Adds the `extraExts` and `ee` options to preserve the old behavior of adding extensions to watch.
* You can now use `server.on 'error'` in your code to catch the "port in use" message gracefully. The CLI now handles this nicely as well.

### 0.6.3
* Updated to use Chokidar 1.7, which hopefully fixes some memory issues.
* BUGFIX: Check to see if a `watcher` object is actually defined before attempting to close.
* Added deprecation warning for `exts` option. In the next version, extensions you specify on the command line will OVERRIDE the default extensions. We'll add a new option for adding your exts to the defaults.
* Modified CLI so it trims spaces from the extensions in the array, just in case you put spaces between the commas.

### 0.6.2
* CLI now properly splits extension list. Previous versions appended a blank entry to the list of extensions.
* CLI now requires extensions to  be comma separated instead of space separated.
* Added extra debugging info (protocol version, watched directory, extensions, and exclusions).
* Cleaned up some inconsistencies in the code.

### 0.6.1
* Fix default exclusions regex

### 0.6.0
* Implements LiveReload protocol v7 so browser plugins work again.
* Removes support for protocol v6
* Introduces `noListen` option
* Introduces optional callback which will be invoked when the LiveReload server is listening

### 0.5.0
* Updated `ws` library
* Fix issues with exclusions
* Allow watching multiple paths from CLI
* Added `delay` option

### 0.4.1
* Remove some bad JS code
  
### 0.4.0
* Rewritten using Chokidar library and `ws` library
* Added `usePolling` option
* Added support for specifying additional extensions from the CLI

Older version history not kept.

# License

Copyright (c) 2010-2021 Brian P. Hogan and Joshua Peek

Released under the MIT license. See `LICENSE` for details.

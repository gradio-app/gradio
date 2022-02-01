# rollup-plugin-svelte changelog

## 7.1.0

* Preprocessor sourcemap support ([#157](https://github.com/sveltejs/rollup-plugin-svelte/pull/157))

## 7.0.0

* New minimum version requirements ([#138](https://github.com/sveltejs/rollup-plugin-svelte/pull/138), [#142](https://github.com/sveltejs/rollup-plugin-svelte/pull/142)):
    * Rollup 2+
    * Svelte 3.5+ (Svelte 2 is no longer supported)
    * Node 10+
* Breaking: Offload CSS handling to Rollup — you will now need an external plugin like `rollup-plugin-css-only` to extract your styles to `.css` files [as demonstrated in the template](https://github.com/sveltejs/template/blob/5b1135c286f7a649daa99825a077586655051649/rollup.config.js#L48) ([#147](https://github.com/sveltejs/rollup-plugin-svelte/pull/147))
* Breaking: Options to be passed directly to the Svelte compiler must now go under a `compilerOptions` key in the plugin configuration object ([#145](https://github.com/sveltejs/rollup-plugin-svelte/pull/145))
* Extend `CompileOptions` interface directly ([#126](https://github.com/sveltejs/rollup-plugin-svelte/pull/126))
* Pass relative `filename` to svelte compiler ([#131](https://github.com/sveltejs/rollup-plugin-svelte/pull/131))
* Link `sourcemap` with source correctly ([#140](https://github.com/sveltejs/rollup-plugin-svelte/pull/140))
* Respect `sourcemapExcludeSources` Rollup config ([#93](https://github.com/sveltejs/rollup-plugin-svelte/pull/93))
* Keep all sourcemaps from chunk ([#44](https://github.com/sveltejs/rollup-plugin-svelte/pull/44))

## 6.1.1

* Use `require('svelte/compiler')` rather than `require('svelte/compiler.js')` to work with new Svelte exports map

## 6.1.0

* feat: allow custom Svelte compilers via new `svelte` option: ([#124](https://github.com/sveltejs/rollup-plugin-svelte/pull/124))
* fix: use native `fs.existsSync` method: ([`50e03e5`](https://github.com/sveltejs/rollup-plugin-svelte/commit/50e03e5))
* chore: Power CI via GitHub Action ([`61ead9a..23e83a4`](https://github.com/sveltejs/rollup-plugin-svelte/compare/61ead9a..23e83a4))

## 6.0.2

* Added default value to CssWriter.write map option ([#135](https://github.com/sveltejs/rollup-plugin-svelte/pull/135))
* Do not warn about missing unused css selectors if both css and emitCss are false ([#127](https://github.com/sveltejs/rollup-plugin-svelte/pull/127))

## 6.0.1

* Fix types to allow `css: false` ([#125](https://github.com/sveltejs/rollup-plugin-svelte/pull/125))

## 6.0.0

* Breaking changes:
	* Rollup 1.19.2+ is now required
	* The path passed to `css.write()` is now relative to the destination directory.
* Other changes:
	* Add types for `generate`, `customElement`, and `preprocess` options ([#111](https://github.com/sveltejs/rollup-plugin-svelte/pull/111), [#114](https://github.com/sveltejs/rollup-plugin-svelte/pull/114), and [#118](https://github.com/sveltejs/rollup-plugin-svelte/pull/118))
	* Use Rollup's `emitFile` API ([#72](https://github.com/sveltejs/rollup-plugin-svelte/pull/72))
	* Warn when `package.json` does not expose itself via `exports` ([#119](https://github.com/sveltejs/rollup-plugin-svelte/pull/119))

## 5.2.3

* Actually publish typings ([#110](https://github.com/sveltejs/rollup-plugin-svelte/issues/110))

## 5.2.2

* Handle files with `.svelte` in the middle of their filename ([#107](https://github.com/sveltejs/rollup-plugin-svelte/pull/107))

## 5.2.1

* Revert accidental change to Rollup peer dependency

## 5.2.0

* Deterministic CSS bundle order ([#84](https://github.com/sveltejs/rollup-plugin-svelte/issues/84))
* Add typings ([#90](https://github.com/sveltejs/rollup-plugin-svelte/pull/90))

## 5.1.1

* Use Svelte 3's built-in logic for automatically determining the component name from its file path ([#74](https://github.com/rollup/rollup-plugin-svelte/issues/74))

## 5.1.0

* Support array of preprocessors in Svelte 3

## 5.0.3

* Handle `onwarn` correctly in new Svelte 3 beta

## 5.0.2

* Support latest Svelte 3 beta

## 5.0.1

* Use `this.addWatchFile` if present ([#46](https://github.com/rollup/rollup-plugin-svelte/pull/46))

## 5.0.0
*2018-12-16*
* Replace deprecated `ongenerate` hook, use Rollup's internal warning mechanism; requires rollup@0.60+ ([#45](https://github.com/rollup/rollup-plugin-svelte/issues/45))

## 4.5.0

* Pass `dependencies` through from preprocessors ([#40](https://github.com/rollup/rollup-plugin-svelte/issues/40))

## 4.4.0

* Support Svelte 3 alpha
* Internal reorganisation

## 4.3.2

* Remove deprecated `onerror` handler

## 4.3.1

* Handle arbitrary file extensions ([#38](https://github.com/rollup/rollup-plugin-svelte/pull/38))
* Generate Windows-friendly import paths ([#38](https://github.com/rollup/rollup-plugin-svelte/pull/38))

## 4.3.0

* Append inline sourcemaps to virtual CSS files generated with `emitCss: true` ([#36](https://github.com/rollup/rollup-plugin-svelte/pull/36))

## 4.2.1

* Fix `emitCss` with style-less components ([#34](https://github.com/rollup/rollup-plugin-svelte/pull/34))

## 4.2.0

* Add `emitCss` option ([#32](https://github.com/rollup/rollup-plugin-svelte/pull/32))

## 4.1.0

* Support Svelte 1.60 and above ([#29](https://github.com/rollup/rollup-plugin-svelte/pull/29))

## 4.0.0

* Move `svelte` to `peerDependencies` ([#25](https://github.com/rollup/rollup-plugin-svelte/issues/25))

## 3.3.0

* Pass ID as `filename` to `preprocess` ([#24](https://github.com/rollup/rollup-plugin-svelte/pull/24))

## 3.2.0

* Support `preprocess` option ([#21](https://github.com/rollup/rollup-plugin-svelte/issues/21))
* Ignore unused CSS selector warnings if `css: false` ([#17](https://github.com/rollup/rollup-plugin-svelte/issues/17))

## 3.1.0

* Allow `shared` option to override default ([#16](https://github.com/rollup/rollup-plugin-svelte/pull/16))
* Use `this.warn` and `this.error`, so Rollup can handle failures

## 3.0.1

* `svelte` should be a dependency, not a devDependency...

## 3.0.0

* CSS sourcemaps ([#14](https://github.com/rollup/rollup-plugin-svelte/issues/14))

## 2.0.3

* Ignore virtual modules ([#13](https://github.com/rollup/rollup-plugin-svelte/issues/13))

## 2.0.2

* Only include `code` and `map` in object passed to Rollup

## 2.0.1

* Prevent import of built-in modules from blowing up the resolver

## 2.0.0

* Add support for `pkg.svelte` and `pkg['svelte.root']`

## 1.8.1

* Handle components without `<style>` tags when concatenating CSS

## 1.8.0

* Allow `options.css` to be a function that is called with extracted CSS when bundle is generated

## 1.7.0

* Pass all options through to Svelte (e.g. `dev`)

## 1.6.1

* Capitalize component names correctly

## 1.6.0

* Update Svelte
* Use shared helpers

## 1.3.1

* Sanitize constructor names

## 1.3.0

* Update Svelte
* Add support for `generate: 'ssr'`
* Enforce `es` format

## 1.2.5

* Update Svelte
* Include code frame in error message

## 1.2.0

* Update Svelte
* Support `css` and `filename` options

## 1.0.0

* Update Svelte

## 0.3.0

* Update Svelte

## 0.2.0

* Update Svelte
* Set `options.name` to basename of file

## 0.1.1

* Update Svelte

## 0.1.0

* Update Svelte
* Install missing `rollup-pluginutils` dependency

## 0.0.2

* First release

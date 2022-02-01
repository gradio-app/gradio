# @rollup/plugin-commonjs ChangeLog

## v17.1.0

_2021-01-29_

### Bugfixes

- fix: correctly replace shorthand `require` (#764)

### Features

- feature: load dynamic commonjs modules from es `import` (#766)
- feature: support cache/resolve access inside dynamic modules (#728)
- feature: allow keeping `require` calls inside try-catch (#729)

### Updates

- chore: fix lint error (#719)

## v17.0.0

_2020-11-30_

### Breaking Changes

- feat!: reconstruct real es module from \_\_esModule marker (#537)

## v16.0.0

_2020-10-27_

### Breaking Changes

- feat!: Expose cjs detection and support offline caching (#604)

### Bugfixes

- fix: avoid wrapping `commonjsRegister` call in `createCommonjsModule(...)` (#602)
- fix: register dynamic modules when a different loader (i.e typescript) loads the entry file (#599)
- fix: fixed access to node_modules dynamic module with subfolder (i.e 'logform/json') (#601)

### Features

- feat: pass type of import to node-resolve (#611)

## v15.1.0

_2020-09-21_

### Features

- feat: inject \_\_esModule marker into ES namespaces and add Object prototype (#552)
- feat: add requireReturnsDefault to types (#579)

## v15.0.0

_2020-08-13_

### Breaking Changes

- feat!: return the namespace by default when requiring ESM (#507)
- fix!: fix interop when importing CJS that is transpiled ESM from an actual ESM (#501)

### Bugfixes

- fix: add .cjs to default file extensions. (#524)

### Updates

- chore: update dependencies (fe399e2)

## v14.0.0

_2020-07-13_

### Release Notes

This restores the fixes from v13.0.1, but as a semver compliant major version.

## v13.0.2

_2020-07-13_

### Rollback

Rolls back breaking change in v13.0.1 whereby the exported `unwrapExports` method was removed.

## v13.0.1

_2020-07-12_

### Bugfixes

- fix: prevent rewrite require.resolve (#446)
- fix: Support \_\_esModule packages with a default export (#465)

## v13.0.0

_2020-06-05_

### Breaking Changes

- fix!: remove namedExports from types (#410)
- fix!: do not create fake named exports (#427)

### Bugfixes

- fix: \_\_moduleExports in multi entry + inter dependencies (#415)

## v12.0.0

_2020-05-20_

### Breaking Changes

- feat: add kill-switch for mixed es-cjs modules (#358)
- feat: set syntheticNamedExports for commonjs modules (#149)

### Bugfixes

- fix: expose the virtual `require` function on mock `module`. fixes #307 (#326)
- fix: improved shouldWrap logic. fixes #304 (#355)

### Features

- feat: support for explicit module.require calls. fixes #310 (#325)

## v11.1.0

_2020-04-12_

### Bugfixes

- fix: produce legal variable names from filenames containing hyphens. (#201)

### Features

- feat: support dynamic require (#206)
- feat: export properties defined using Object.defineProperty(exports, ..) (#222)

### Updates

- chore: snapshot mismatch running tests before publish (d6bbfdd)
- test: add snapshots to all "function" tests (#218)

## v11.0.2

_2020-02-01_

### Updates

- docs: fix link for plugin-node-resolve (#170)
- chore: update dependencies (5405eea)
- chore: remove jsnext:main (#152)

## v11.0.1

_2020-01-04_

### Bugfixes

- fix: module.exports object spread (#121)

## 11.0.0

_2019-12-13_

- **Breaking:** Minimum compatible Rollup version is 1.20.0
- **Breaking:** Minimum supported Node version is 8.0.0
- Published as @rollup/plugin-commonjs

## 10.1.0

_2019-08-27_

- Normalize ids before looking up in named export map ([#406](https://github.com/rollup/rollup-plugin-commonjs/issues/406))
- Update README.md with note on symlinks ([#405](https://github.com/rollup/rollup-plugin-commonjs/issues/405))

## 10.0.2

_2019-08-03_

- Support preserveSymlinks: false ([#401](https://github.com/rollup/rollup-plugin-commonjs/issues/401))

## 10.0.1

_2019-06-27_

- Make tests run with Node 6 again and update dependencies ([#389](https://github.com/rollup/rollup-plugin-commonjs/issues/389))
- Handle builtins appropriately for resolve 1.11.0 ([#395](https://github.com/rollup/rollup-plugin-commonjs/issues/395))

## 10.0.0

_2019-05-15_

- Use new Rollup@1.12 context functions, fix issue when resolveId returns an object ([#387](https://github.com/rollup/rollup-plugin-commonjs/issues/387))

## 9.3.4

_2019-04-04_

- Make "extensions" optional ([#384](https://github.com/rollup/rollup-plugin-commonjs/issues/384))
- Use same typing for include and exclude properties ([#385](https://github.com/rollup/rollup-plugin-commonjs/issues/385))

## 9.3.3

_2019-04-04_

- Remove colon from module prefixes ([#371](https://github.com/rollup/rollup-plugin-commonjs/issues/371))

## 9.3.2

_2019-04-04_

- Use shared extractAssignedNames, fix destructuring issue ([#303](https://github.com/rollup/rollup-plugin-commonjs/issues/303))

## 9.3.1

_2019-04-04_

- Include typings in release ([#382](https://github.com/rollup/rollup-plugin-commonjs/issues/382))

## 9.3.0

_2019-04-03_

- Add TypeScript types ([#363](https://github.com/rollup/rollup-plugin-commonjs/issues/363))

## 9.2.3

_2019-04-02_

- Improve support for ES3 browsers ([#364](https://github.com/rollup/rollup-plugin-commonjs/issues/364))
- Add note about monorepo usage to readme ([#372](https://github.com/rollup/rollup-plugin-commonjs/issues/372))
- Add .js extension to generated helper file ([#373](https://github.com/rollup/rollup-plugin-commonjs/issues/373))

## 9.2.2

_2019-03-25_

- Handle array destructuring assignment ([#379](https://github.com/rollup/rollup-plugin-commonjs/issues/379))

## 9.2.1

_2019-02-23_

- Use correct context when manually resolving ids ([#370](https://github.com/rollup/rollup-plugin-commonjs/issues/370))

## 9.2.0

_2018-10-10_

- Fix missing default warning, produce better code when importing known ESM default exports ([#349](https://github.com/rollup/rollup-plugin-commonjs/issues/349))
- Refactor code and add prettier ([#346](https://github.com/rollup/rollup-plugin-commonjs/issues/346))

## 9.1.8

_2018-09-18_

- Ignore virtual modules created by other plugins ([#327](https://github.com/rollup/rollup-plugin-commonjs/issues/327))
- Add "location" and "process" to reserved words ([#330](https://github.com/rollup/rollup-plugin-commonjs/issues/330))

## 9.1.6

_2018-08-24_

- Keep commonJS detection between instantiations ([#338](https://github.com/rollup/rollup-plugin-commonjs/issues/338))

## 9.1.5

_2018-08-09_

- Handle object form of input ([#329](https://github.com/rollup/rollup-plugin-commonjs/issues/329))

## 9.1.4

_2018-07-27_

- Make "from" a reserved word ([#320](https://github.com/rollup/rollup-plugin-commonjs/issues/320))

## 9.1.3

_2018-04-30_

- Fix a caching issue ([#316](https://github.com/rollup/rollup-plugin-commonjs/issues/316))

## 9.1.2

_2018-04-30_

- Re-publication of 9.1.0

## 9.1.1

_2018-04-30_

- Fix ordering of modules when using rollup 0.58 ([#302](https://github.com/rollup/rollup-plugin-commonjs/issues/302))

## 9.1.0

- Do not automatically wrap modules with return statements in top level arrow functions ([#302](https://github.com/rollup/rollup-plugin-commonjs/issues/302))

## 9.0.0

- Make rollup a peer dependency with a version range ([#300](https://github.com/rollup/rollup-plugin-commonjs/issues/300))

## 8.4.1

- Re-release of 8.3.0 as #287 was actually a breaking change

## 8.4.0

- Better handle non-CJS files that contain CJS keywords ([#285](https://github.com/rollup/rollup-plugin-commonjs/issues/285))
- Use rollup's plugin context`parse` function ([#287](https://github.com/rollup/rollup-plugin-commonjs/issues/287))
- Improve error handling ([#288](https://github.com/rollup/rollup-plugin-commonjs/issues/288))

## 8.3.0

- Handle multiple entry points ([#283](https://github.com/rollup/rollup-plugin-commonjs/issues/283))
- Extract named exports from exported object literals ([#272](https://github.com/rollup/rollup-plugin-commonjs/issues/272))
- Fix when `options.external` is modified by other plugins ([#264](https://github.com/rollup/rollup-plugin-commonjs/issues/264))
- Recognize static template strings in require statements ([#271](https://github.com/rollup/rollup-plugin-commonjs/issues/271))

## 8.2.4

- Don't import default from ES modules that don't export default ([#206](https://github.com/rollup/rollup-plugin-commonjs/issues/206))

## 8.2.3

- Prevent duplicate default exports ([#230](https://github.com/rollup/rollup-plugin-commonjs/pull/230))
- Only include default export when it exists ([#226](https://github.com/rollup/rollup-plugin-commonjs/pull/226))
- Deconflict `require` aliases ([#232](https://github.com/rollup/rollup-plugin-commonjs/issues/232))

## 8.2.1

- Fix magic-string deprecation warning

## 8.2.0

- Avoid using `index` as a variable name ([#208](https://github.com/rollup/rollup-plugin-commonjs/pull/208))

## 8.1.1

- Compatibility with 0.48 ([#220](https://github.com/rollup/rollup-plugin-commonjs/issues/220))

## 8.1.0

- Handle `options.external` correctly ([#212](https://github.com/rollup/rollup-plugin-commonjs/pull/212))
- Support top-level return ([#195](https://github.com/rollup/rollup-plugin-commonjs/pull/195))

## 8.0.2

- Fix another `var` rewrite bug ([#181](https://github.com/rollup/rollup-plugin-commonjs/issues/181))

## 8.0.1

- Remove declarators within a var declaration correctly ([#179](https://github.com/rollup/rollup-plugin-commonjs/issues/179))

## 8.0.0

- Prefer the names dependencies are imported by for the common `var foo = require('foo')` pattern ([#176](https://github.com/rollup/rollup-plugin-commonjs/issues/176))

## 7.1.0

- Allow certain `require` statements to pass through unmolested ([#174](https://github.com/rollup/rollup-plugin-commonjs/issues/174))

## 7.0.2

- Handle duplicate default exports ([#158](https://github.com/rollup/rollup-plugin-commonjs/issues/158))

## 7.0.1

- Fix exports with parentheses ([#168](https://github.com/rollup/rollup-plugin-commonjs/issues/168))

## 7.0.0

- Rewrite `typeof module`, `typeof module.exports` and `typeof exports` as `'object'` ([#151](https://github.com/rollup/rollup-plugin-commonjs/issues/151))

## 6.0.1

- Don't overwrite globals ([#127](https://github.com/rollup/rollup-plugin-commonjs/issues/127))

## 6.0.0

- Rewrite top-level `define` as `undefined`, so AMD-first UMD blocks do not cause breakage ([#144](https://github.com/rollup/rollup-plugin-commonjs/issues/144))
- Support ES2017 syntax ([#132](https://github.com/rollup/rollup-plugin-commonjs/issues/132))
- Deconflict exported reserved keywords ([#116](https://github.com/rollup/rollup-plugin-commonjs/issues/116))

## 5.0.5

- Fix parenthesis wrapped exports ([#120](https://github.com/rollup/rollup-plugin-commonjs/issues/120))

## 5.0.4

- Ensure named exports are added to default export in optimised modules ([#112](https://github.com/rollup/rollup-plugin-commonjs/issues/112))

## 5.0.3

- Respect custom `namedExports` in optimised modules ([#35](https://github.com/rollup/rollup-plugin-commonjs/issues/35))

## 5.0.2

- Replace `require` (outside call expressions) with `commonjsRequire` helper ([#77](https://github.com/rollup/rollup-plugin-commonjs/issues/77), [#83](https://github.com/rollup/rollup-plugin-commonjs/issues/83))

## 5.0.1

- Deconflict against globals ([#84](https://github.com/rollup/rollup-plugin-commonjs/issues/84))

## 5.0.0

- Optimise modules that don't need to be wrapped in a function ([#106](https://github.com/rollup/rollup-plugin-commonjs/pull/106))
- Ignore modules containing `import` and `export` statements ([#96](https://github.com/rollup/rollup-plugin-commonjs/pull/96))

## 4.1.0

- Ignore dead branches ([#93](https://github.com/rollup/rollup-plugin-commonjs/issues/93))

## 4.0.1

- Fix `ignoreGlobal` option ([#86](https://github.com/rollup/rollup-plugin-commonjs/pull/86))

## 4.0.0

- Better interop and smaller output ([#92](https://github.com/rollup/rollup-plugin-commonjs/pull/92))

## 3.3.1

- Deconflict export and local module ([rollup/rollup#554](https://github.com/rollup/rollup/issues/554))

## 3.3.0

- Keep the order of execution for require calls ([#43](https://github.com/rollup/rollup-plugin-commonjs/pull/43))
- Use interopDefault as helper ([#42](https://github.com/rollup/rollup-plugin-commonjs/issues/42))

## 3.2.0

- Use named exports as a function when no default export is defined ([#524](https://github.com/rollup/rollup/issues/524))

## 3.1.0

- Replace `typeof require` with `'function'` ([#38](https://github.com/rollup/rollup-plugin-commonjs/issues/38))
- Don't attempt to resolve entry file relative to importer ([#63](https://github.com/rollup/rollup-plugin-commonjs/issues/63))

## 3.0.2

- Handle multiple references to `global`

## 3.0.1

- Return a `name`

## 3.0.0

- Make `transform` stateless ([#71](https://github.com/rollup/rollup-plugin-commonjs/pull/71))
- Support web worker `global` ([#50](https://github.com/rollup/rollup-plugin-commonjs/issues/50))
- Ignore global with `options.ignoreGlobal` ([#48](https://github.com/rollup/rollup-plugin-commonjs/issues/48))

## 2.2.1

- Prevent false positives with `namedExports` ([#36](https://github.com/rollup/rollup-plugin-commonjs/issues/36))

## 2.2.0

- Rewrite top-level `this` expressions to mean the same as `global` ([#31](https://github.com/rollup/rollup-plugin-commonjs/issues/31))

## 2.1.0

- Optimised module wrappers ([#20](https://github.com/rollup/rollup-plugin-commonjs/pull/20))
- Allow control over named exports via `options.namedExports` ([#18](https://github.com/rollup/rollup-plugin-commonjs/issues/18))
- Handle bare imports correctly ([#23](https://github.com/rollup/rollup-plugin-commonjs/issues/23))
- Blacklist all reserved words as export names ([#21](https://github.com/rollup/rollup-plugin-commonjs/issues/21))
- Configure allowed file extensions via `options.extensions` ([#27](https://github.com/rollup/rollup-plugin-commonjs/pull/27))

## 2.0.0

- Support for transpiled modules – `exports.default` is used as the default export in place of `module.exports`, if applicable, and `__esModule` is not exported ([#16](https://github.com/rollup/rollup-plugin-commonjs/pull/16))

## 1.4.0

- Generate sourcemaps by default

## 1.3.0

- Handle references to `global` ([#6](https://github.com/rollup/rollup-plugin-commonjs/issues/6))

## 1.2.0

- Generate named exports where possible ([#5](https://github.com/rollup/rollup-plugin-commonjs/issues/5))
- Handle shadowed `require`/`module`/`exports`

## 1.1.0

- Handle dots in filenames ([#3](https://github.com/rollup/rollup-plugin-commonjs/issues/3))
- Wrap modules in IIFE for more readable output

## 1.0.0

- Stable release, now that Rollup supports plugins

## 0.2.1

- Allow mixed CommonJS/ES6 imports/exports
- Use `var` instead of `let`

## 0.2.0

- Sourcemap support
- Support `options.include` and `options.exclude`
- Bail early if module is obviously not a CommonJS module

## 0.1.1

Add dist files to package (whoops!)

## 0.1.0

- First release

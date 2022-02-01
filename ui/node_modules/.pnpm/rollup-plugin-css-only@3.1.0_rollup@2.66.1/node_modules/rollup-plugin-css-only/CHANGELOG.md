# Changelog

All notable changes to `rollup-plugin-css-only` will be documented in this file.

## [Unreleased]

## [3.1.0] - 2020-12-18
### Changed
- Require @rollup/pluginutils@4

## [3.0.0] - 2020-11-19
### Changed
- Maintain import order of stylesheets when combining #21 @staydecent
- Use emitFile instead of outputFile #24 @benmccann
- Upgrade dependencies @thgh

## [2.1.0] - 2020-06-02
### Added
- Mark as compatible with rollup 2 #14 @yagebu

### Changed
- Fix file writing errors #19 @aminya 
- Upgrade dependencies #14 @yagebu

## [2.0.0] - 2019-12-21
### Added
- Add `bundle` as 3rd argument in `output` function @lazyhero

### Changed
- Replace mkdirp by fs.mkdir (Node.js 10.12+) @MichaelAllenHardeman

## [1.0.0] - 2019-01-27
### Added
- Add ES modules build: `dist/index.es.js`

### Changed
- Migrate to Rollup v1 @tlvince


[Unreleased]: https://github.com/thgh/rollup-plugin-css-only/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/thgh/rollup-plugin-css-only/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/thgh/rollup-plugin-css-only/compare/v0.0.1...v1.0.0
[0.0.1]: https://github.com/thgh/rollup-plugin-css-only/releases

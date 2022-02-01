# Change Log
All notable changes to this project will be documented in this file.

## [next]
### BREAKING CHANGES

### Features

### Fixes

### Tests

### Dependencies

## [3.0.5]
### Fixes

- Remove .css from default extensions in readme.md (@dosentmatter, #106)
- Expand Travis CI test matrix (@xzyfer)

### Tests

- Test yargs version support in CI  (@xzyfer)

### Dependencies

- Bump yargs@^13.3.2 (@xzyfer, #108)

## [3.0.4]
### Fixes

- don't crash on non-atomic saves (@adnelson, #101)

## [3.0.3]
### Dependencies

- yargs@^12.0.2 (@patricksmms, #97)
- mocha@^5.2.0 (@patricksmms, #97)
- nyc@^13.1.0 (@patricksmms, #97)

## [3.0.2]
### Dependencies

- lodash@^4.17.11 (@patricksmms, #95)

## [3.0.1]
### Fixes

- Add MIT license (@char0n, #93)

## [3.0.0]
### BREAKING CHANGES

- Drop support Node < 6 (@realityking, #88, @xzyfer 3b2ec74)
- Don't add .css imports to the graph by default (@xzyfer, #91)

### Features

- Add option to exclude files based on regular expression (@Iambecomeroot, #86)

### Fixes

- Fix broken bounds check in CLI (@xzyfer, 5dd065e)

### Dependencies

- yargs@^10.0.3 (@realityking, #88)
- chai@^4.1.2 (@realityking, #88)
- coveralls@^3.0.0 (@realityking, #88)
- mocha@^4.0.1 (@realityking, #88)
- nyc@^11.2.1 (@realityking, #88)
- scss-tokenizer@^0.3.0 (@xzyfer, 3b2ec74)

## [2.2.4]
### Dependencies

- yargs@^7.0.0 (@alan-agius4, #84)

## [2.2.3]
### Dependencies

- scss-tokenizer@^0.2.3 (@xzyfer)

## [2.2.2]
### Fixes

- Babel runtime error messages (@xzyfer, #76 #77)

### Dependencies

- scss-tokenizer@^0.2.1 (@xzyfer)

## [2.2.1]
### Fixes

- Babel runtime error messages (@STRML, #76 #77)

### Dependencies

- scss-tokenizer@^0.2.0

## [2.2.0]
### Features

- Replace `@import` regexes with [scss-tokenizer](https://www.npmjs.com/package/scss-tokenizer) (@xzyfer, #68)
- Add support for the old indented (`.sass`) syntax (@xzyfer, #31)
- Add an option to follow symbolic links (@ludwiktrammer, #74)

### Fixes

- Replaces deprecated `fs.existsSync` (@martinheidegger, #29)

### Tests

- Significantly clean up test suite (@xzyfer, #69)

### Dependencies

- yargs@^6.6.0
- mocha@^3.2.0

## [2.1.2]
### Fixes

- Remove non-essential files from npm package (@jorrit, #48)
- Update yargs to version 4.7.1 (@greenkeeperio-bot, #46)
- Update glob to version 7.0.0 (@greenkeeperio-bot, #36)

## [2.1.1]
### Fixes

- Don't add directory `@import`s to graph - [@niksy](https://github.com/niksy)

## [2.1.0]
### Features

- Update to lodash 4 - [@nightwolfz](https://github.com/nightwolfz)

### Fixes

- Fixed directories with extensions being treated as files - [@niksy](https://github.com/niksy)

## [2.0.1]
### Fixes
- Fixed tests for Windows - [@pleunv](https://github.com/pleunv)

## [2.0.0]
### BREAKING CHANGES
- `.sass` files are not included in the graph by default. Use the `-e .sass` flag.

### Features
- Configurable file extensions - [@dannymidnight](https://github.com/dannymidnight), [@xzyfer](https://github.com/xzyfer)

### Fixes
- Prioritize cwd when resolving load paths - [@schnerd](https://github.com/schnerd)

### Tests
- Added test for prioritizing cwd when resolving load paths - [@xzyfer](https://github.com/xzyfer)

## [1.3.0]
### Features
- Add support for indented syntax - [@vegetableman](https://github.com/vegetableman)

## [1.2.0]
### Features
- Add support for custom imports - [@kevin-smets](https://github.com/kevin-smets)

## [1.1.0] - 2015-03-18
### Fixes
- Only strip extension for css, scss, sass files - [@nervo](https://github.com/nervo)

## [1.0.4] - 2015-03-03
### Tests
- Added a test for nested imports - [@kevin-smets](https://github.com/kevin-smets)

## [1.0.3] - 2015-02-02
### Fixes
- Replace incorrect usage of `for..in` loops with simple `for` loops

## [1.0.2] - 2015-02-02
### Fixes
- Don't iterate over inherited object properties

## [1.0.1] - 2015-01-05
### Fixes
- Handle errors in the visitor

## [1.0.0] - 2015-01-05

Initial stable release

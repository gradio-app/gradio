# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## 4.2.3
* Fixed declarations after nested rule and before at-rule (by Rodion Demikhov).

## 4.2.2
* Fixed wrong specificity order of declarations (by Rodion Demikhov).

## 4.2.1
* Fix TypeScript definitions (by Avi Vahl).

## 4.2
* Add `@at-root` support (by Jason Quense).

## 4.1.2
* Improve error messsage on broken selector

## 4.1.1
* Add `&(:hover)` support (by Ben Delarre).

## 4.1
* Add `unwrap` option.

## 4.0
* Use PostCSS 7 (by Aleks Hudochenkov).
* Remove Node.js 4 support.

## 3.0
* Add `@font-face` to bubbling at-rules (by Valeriy Komlev).
* Add special logic for `@font-face` bubbling (by Phanindra Pydisetty).
* Use PostCSS selector parser 3.0.

## 2.1.2
* Fix replacing multiple `&`.

## 2.1.1
* Fix `:not(&)` support.

## 2.1
* Add `preserveEmpty` option (by Federico Zivolo).

## 2.0.4
* Fix finding `&` in some selectors (by Stepan Mikhaylyuk).

## 2.0.3
* Doesn’t replace `&` inside string (by Paul Kiddle).

## 2.0.2
* Fix comments moving regression.

## 2.0.1
* Fix rules order regression (by Dmitry Vibe).

## 2.0
* Use PostCSS 6 API.

## 1.0.1
* Clean up npm package.

## 1.0
* Use PostCSS 5.0 API.
* Do not add spaces to selector in compressed CSS.
* Move nodes with its comment above.

## 0.3.2
* Fix `@supports` at-rule support (by Ben Briggs).

## 0.3.1
* Pass PostCSS Plugin Guidelines.

## 0.3
* Do not unwrap custom at-rules.
* Add `bubble` option to unwrap some custom at-rules.
* Support PostCSS 4.1 API.
* Fix last semicolon after unwrapping.

## 0.2.2
* Module returns function to have common PostCSS API.

## 0.2.1
* Add comma support to selectors unwrap.

## 0.2
* Use PostCSS 4.0.
* Fix indent, when move rules to other parent.

## 0.1
* Initial release.

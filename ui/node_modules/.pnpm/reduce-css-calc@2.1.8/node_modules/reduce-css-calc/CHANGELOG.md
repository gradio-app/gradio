# Changelog of `reduce-css-call`

## 2.1.8 - 2020-01-08

- Fix Parse error on custom property fallback ([#68](https://github.com/MoOx/reduce-css-calc/pull/68)) - @snowystinger)

## 2.1.7 - 2019-10-22

- Switch to a maintained jison fork ([#57](https://github.com/MoOx/reduce-css-calc/pull/57)) - @davidgovea)

## 2.1.6 - 2019-01-11

- Fixed: Incorrect calculation when subtracting (e.g. `calc(100% - calc(120px + 1em + 2em + 100px))`) ([#52](https://github.com/MoOx/reduce-css-calc/pull/53) - @sylvainpolletvillard)

## 2.1.5 - 2018-09-20

- [Avoid breaking when seeing ` constant()`` or `env()`](https://github.com/MoOx/reduce-css-calc/commit/409c9ba2cd5e06e7f8f679f7f0c3c3a14ff3e673) by @dlee

## 2.1.4 - 2018-01-22

- Prevent webpack parsing issue
  (see https://github.com/zaach/jison/pull/352)

## 2.1.3 - 2017-11-27

- Fixed: Incorrect reduction for a specific case (e.g. `calc(1em + (1em - 5px))`) ([#43](https://github.com/MoOx/reduce-css-calc/pull/43) - @Justineo)

## 2.1.2 - 2017-11-26

- Fixed: Incorrect reduction of division with custom property (e.g. `calc(var(--foo) / 2)`) ([#41](https://github.com/MoOx/reduce-css-calc/issues/41) - @Semigradsky)

## 2.1.1 - 2017-10-12

- Fixed: Incorrect reduction of nested expression (e.g. `calc( (1em - calc( 10px + 1em)) / 2)`) ([#39](https://github.com/MoOx/reduce-css-calc/pull/39) - @gyoshev)

## 2.1.0 - 2017-10-10

- Added: Support for working in browsers without transpiling ([#36](https://github.com/MoOx/reduce-css-calc/pull/36) - @Semigradsky)
- Fixed: `calc(100vw - (100vw - 100%))` does not evaluate to `100%` ([#35](https://github.com/MoOx/reduce-css-calc/pull/35) - @Semigradsky)

## 2.0.5 - 2017-05-12

- Fixed: Support division with a CSS variable.

## 2.0.4 - 2017-05-09

- Fixed: CSS variable regex was overly greedy and caused a crash in some
  cases. ([#27](https://github.com/MoOx/reduce-css-calc/pull/27) - @andyjansson)

## 2.0.3 - 2017-05-09

- Fixed: Regression in handling decimals without having any numbers after
  the decimal place (e.g. `10.px`).

## 2.0.2 - 2017-05-08

- Fixed: Regression in consecutive subtraction handling
  ([#25](https://github.com/MoOx/reduce-css-calc/pull/25) - @andyjansson)

## 2.0.1 - 2017-05-08

- Fixed: Support for nested calc e.g. `calc(100% - calc(50px - 25px))`.
- Fixed: Support for CSS variables e.g. `calc(var(--mouseX) * 1px)`.

## 2.0.0 - 2017-05-08

- Rewritten with a jison parser for more accurate value parsing.
- Breaking: reduce-css-calc will now throw when trying to multiply or divide
  by the same unit (e.g. `calc(200px * 20px)`), and also when trying to divide
  by zero.
- Added: Better handling of zero values (e.g. `calc(100vw / 2 - 6px + 0px)`
  becomes `calc(100vw / 2 - 6px)`).
- Added: Better handling of mixed time values (e.g. `calc(1s - 50ms)`
  becomes `0.95s`).
- Added: Inner parentheses calculation to simplify complex expressions (e.g.
  `calc(14px + 6 * ((100vw - 320px) / 448))` becomes `calc(9.71px + 1.34vw)`
  with precision set to `2`).
- Fixed: `calc(1px + 1)` does not evaluate to `2px`.

([#22](https://github.com/MoOx/reduce-css-calc/pull/22) - @andyjansson)

## 1.3.0 - 2016-08-26

- Added: calc identifier from unresolved nested expressions are removed for
  better browser support
  ([#19](https://github.com/MoOx/reduce-css-calc/pull/19) - @ben-eb)

## 1.2.8 - 2016-08-26

- Fixed: regression from 1.2.5 on calc() with value without leading 0
  ([#17](https://github.com/MoOx/reduce-css-calc/pull/17) - @ben-eb)

## 1.2.7 - 2016-08-22

- Fixed: regression from 1.2.5 on calc() with value without leading 0
  (@MoOx)

## 1.2.6 - 2016-08-22

- Fixed: regression from 1.2.5 on calc() on multiple lines
  (@MoOx)

## 1.2.5 - 2016-08-22

- Fixed: security issue due to the usage of `eval()`.
  This is to avoid an arbitrary code execution.
  Now operations are resolved using
  [`math-expression-evaluator`](https://github.com/redhivesoftware/math-expression-evaluator)

## 1.2.4 - 2016-06-09

- Fixed: zero values are not unitless anymore.
  Browsers do not calculate calc() with 0 unitless values.
  http://jsbin.com/punivivipo/edit?html,css,output
  ([#11](https://github.com/MoOx/reduce-css-calc/pull/11))

## 1.2.3 - 2016-04-28

- Fixed: wrong rouding in some edge cases
  ([#10](https://github.com/MoOx/reduce-css-calc/pull/10))

## 1.2.2 - 2016-04-19

- Fixed: Don't reduce expression containing CSS variables.
  ([#9](https://github.com/MoOx/reduce-css-calc/pull/9))

## 1.2.1 - 2016-02-22

- Fixed: uppercase letters in units are now supported
  ([#8](https://github.com/MoOx/reduce-css-calc/pull/8))

## 1.2.0 - 2014-11-24

- Decimal precision is now customisable as the `precision` option

## 1.1.4 - 2014-11-12

- 5 decimals rounding for everything

## 1.1.3 - 2014-08-13

- 5 decimals rounding for percentage

## 1.1.2 - 2014-08-10

- Prevent infinite loop by adding a `Call stack overflow`
- Correctly ignore unrecognized values (safer evaluation for nested expressions,
  see [postcss/postcss-calc#2](https://github.com/postcss/postcss-calc/issues/2))
- Handle rounding issues (eg: 10% \* 20% now give 2%, not 2.0000000000000004%)

## 1.1.1 - 2014-08-06

- Fix issue when using mutiples differents prefixes in the same function

## 1.1.0 - 2014-08-06

- support more complex formulas
- use `reduce-function-call`
- better error message

## 1.0.0 - 2014-08-04

First release

- based on [rework-calc](https://github.com/reworkcss/rework-calc) v1.1.0
- add error if the calc() embed an empty calc() or empty ()
- jscs + jshint added before tests

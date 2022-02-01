# tinydate ![CI](https://github.com/lukeed/tinydate/workflows/CI/badge.svg)

> A tiny (349B) reusable date formatter. Extremely fast!

[Demo](https://jsfiddle.net/lukeed/aoy0xeze/)

Inspired by [`tinytime`][tinytime], this module returns a "render" function that efficiently re-render your deconstructed template. This allows for [incredibly performant](#benchmarks) results!

However, please notice that this only provides a [limited subset of Date methods](#patterns).<br>
If you need more, [`tinytime`][tinytime] or [`date-fns`](https://github.com/date-fns/date-fns) are great alternatives!

## Install

```
$ npm install --save tinydate
```


## Usage

```js
const tinydate = require('tinydate');
const fooDate = new Date('5/1/2017, 4:30:09 PM');

const stamp = tinydate('Current time: [{HH}:{mm}:{ss}]');

stamp(fooDate);
//=> Current time: [16:30:09]

stamp();
//=> Current time: [17:09:34]
```


## API

### tinydate(pattern, dict?)(date?)
Returns: `Function`

Returns a rendering function that will optionally accept a [`date`](#date) value as its only argument.

#### pattern
Type: `String`<br>
Required: `true`

The template pattern to be parsed.

#### dict
Type: `Object`<br>
Required: `false`

A custom dictionary of template patterns. You may override [existing patterns](#patterns) or declare new ones.

> **Important:** All dictionary items **must be a function** and must control its own formatting.<br>For example, when defining your own `{ss}` template, `tinydate` **will not** pad its value to two digits.

```js
const today = new Date('2019-07-04, 5:30:00 PM');

// Example custom dictionary:
//   - Adds {MMMM}
//   - Overrides {DD}
const stamp = tinydate('Today is: {MMMM} {DD}, {YYYY}', {
	MMMM: d => d.toLocaleString('default', { month: 'long' }),
	DD: d => d.getDate()
});

stamp(today);
//=> 'Today is: July 4, 2019'
```

#### date
Type: `Date`<br>
Default: `new Date()`

The date from which to retrieve values. Defaults to current datetime if no value is provided.


## Patterns

- `{YYYY}`: full year; eg: **2017**
- `{YY}`: short year; eg: **17**
- `{MM}`: month; eg: **04**
- `{DD}`: day; eg: **01**
- `{HH}`: hours; eg: **06** (24h)
- `{mm}`: minutes; eg: **59**
- `{ss}`: seconds; eg: **09**
- `{fff}`: milliseconds; eg: **555**


## Benchmarks

```
# Node v10.13.0

tinydate    x 160,834,214 ops/sec ±0.21% (96 runs sampled)
tinytime    x  44,602,162 ops/sec ±0.34% (97 runs sampled)
time-stamp  x     888,153 ops/sec ±1.27% (86 runs sampled)
```

## License

MIT © [Luke Edwards](https://lukeed.com)

[tinytime]: https://github.com/aweary/tinytime

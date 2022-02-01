# safe-identifier

Sanitize strings for use as JavaScript identifiers & property names.

```
npm install --save safe-identifier
```

```js
import { identifier, property } from 'safe-identifier'

identifier('Foo') === 'Foo'
identifier('enum') === '_enum'
identifier('my var', true) === 'my_var_hk17pp'
identifier(' my \0var ', true) === 'my_var_1d8fi3'

property('Foo', 'bar') === 'Foo.bar'
property('Foo', 'bar\nbar') === 'Foo["bar\\nbar"]'
property(null, 'foo') === 'foo'
property(null, 'void') === '"void"'
```

## `identifier(key: string, unique: boolean): string`

Sanitize a string for use as an identifier name

Replaces invalid character sequences with `_` and may add a `_` prefix if the
resulting name would conflict with a JavaScript reserved name, covering all
standards from ES3 up to ES2018, along with current
[active proposals](https://github.com/tc39/proposals).

If `unique` is true, a 32-bit hash of the `key` is appended to the result in
order to help ensure that different inputs produce different outputs.

## `property(obj: string?, key: string): string`

Sanitize a string for use as a property name

By default uses `obj.key` notation, falling back to `obj["key"]` if the key
contains invalid characters or is an ECMAScript 3rd Edition reserved word
(required for IE8 compatibility). If `obj` is empty, returns only the possibly
quoted property key. The correctness of `obj` is not checked.

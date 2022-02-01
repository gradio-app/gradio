# InternMap

*For live examples, see https://observablehq.com/@mbostock/internmap.*

If you use dates as keys in a JavaScript Map (or as values in a Set), you may be surprised that it won’t work as you expect.

```js
dateMap = new Map([
  [new Date(Date.UTC(2001, 0, 1)), "red"],
  [new Date(Date.UTC(2001, 0, 1)), "green"] // distinct key!
])
```
```js
dateMap.get(new Date(Date.UTC(2001, 0, 1))) // undefined!
```

That’s because Map uses the [SameValueZero algorithm](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) to determine key equality: for two dates to be considered the same, they must be the same instance (the same object), not just the same moment in time. This is true of the equality operator, too.

```js
{
  const date1 = new Date(Date.UTC(2001, 0, 1));
  const date2 = new Date(Date.UTC(2001, 0, 1));
  return date1 === date2; // false!
}
```

You can avoid this issue by using primitive values such as numbers or strings as keys instead. But it’s tedious and easy to forget to coerce types. (You’ll also need to do the inverse type conversion when pulling keys out of the map, say when using *map*.keys or *map*.entries, or when iterating over the map. The inverse above is new Date(*key*). Also, if you forget to coerce your key to a number when using *map*.get, it’s easy not to notice because the map won’t throw an error; it’ll simply return undefined.)

```js
numberMap = new Map([[978307200000, "red"]])
numberMap.get(978307200000) // "red"
numberMap.get(new Date(978307200000)) // undefined; oops!
```

Wouldn’t it be easier if Map and Set “just worked” with dates? Or with any object that supports [*object*.valueOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/valueOf)?

Enter **InternMap**. [*Interning*](https://en.wikipedia.org/wiki/String_interning) refers to storing only one copy of each distinct key. An InternMap considers two Date instances representing the same moment to be equal, storing only the first instance.

```js
map = new InternMap([
  [new Date(Date.UTC(2001, 0, 1)), "red"],
  [new Date(Date.UTC(2001, 0, 1)), "green"] // replaces previous entry
])
```
```js
map.get(new Date(Date.UTC(2001, 0, 1))) // "green"
```
```js
[...map.keys()] // [2001-01-01]
```

InternMap extends Map, so you can simply drop it in whenever you’d prefer this behavior to the SameValueZero algorithm. Because InternMap calls *object*.valueOf only for non-primitive keys, note that you can pass primitive keys, too.

```js
map.get(978307200000) // "green"; this works too!
```

InternMap keeps only the first distinct key according to its associated primitive value. Avoid adding keys to the map with inconsistent types.

```js
map2 = new InternMap([
  [978307200000, "red"], // danger!
  [new Date(Date.UTC(2001, 0, 1)), "blue"]
])
```
```js
map2.get(new Date(Date.UTC(2001, 0, 1))) // "blue"; this still works…
```
```js
[...map2.keys()] // [978307200000]; but the key isn’t a Date
```

While InternMap uses *object*.valueOf by default to compute the intern key, you can pass a key function as a second argument to the constructor to change the behavior. For example, if you use JSON.stringify, you can use arrays as compound keys (assuming that the array elements can be serialized to JSON).

```js
map3 = new InternMap([
  [["foo", "bar"], 1],
  [["foo", "baz"], 2],
  [["goo", "bee"], 3]
], JSON.stringify)
```
```js
map3.get(["foo", "baz"]) // 2
```

There’s an **InternSet** class, too.

```js
set = new InternSet([
  new Date(Date.UTC(2000, 0, 1)),
  new Date(Date.UTC(2001, 0, 1)),
  new Date(Date.UTC(2001, 0, 1))
])
```

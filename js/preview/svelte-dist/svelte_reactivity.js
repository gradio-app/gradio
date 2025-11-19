import { a2 as state, a as active_reaction, w as get, z as set_active_reaction, a4 as user_derived, x as set, v as source, a5 as update_version, a6 as increment } from './index-D9jXyWpQ.js';
export { y as createSubscriber } from './index-D9jXyWpQ.js';
import './custom-element-FNtmsENB.js';
export { M as MediaQuery } from './media-query-DA37RLNM.js';
import './index-DZuH9089.js';
import './constants-BMyj1h3a.js';
import './legacy-client-BvU2XuMp.js';
import './utils-Bmu7F6be.js';
import './reactive-value-BysziQ51.js';

/** @import { Source } from '#client' */

var inited$1 = false;

/**
 * A reactive version of the built-in [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object.
 * Reading the date (whether with methods like `date.getTime()` or `date.toString()`, or via things like [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat))
 * in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated when the value of the date changes.
 *
 * ```svelte
 * <script>
 * 	import { SvelteDate } from 'svelte/reactivity';
 *
 * 	const date = new SvelteDate();
 *
 * 	const formatter = new Intl.DateTimeFormat(undefined, {
 * 	  hour: 'numeric',
 * 	  minute: 'numeric',
 * 	  second: 'numeric'
 * 	});
 *
 * 	$effect(() => {
 * 		const interval = setInterval(() => {
 * 			date.setTime(Date.now());
 * 		}, 1000);
 *
 * 		return () => {
 * 			clearInterval(interval);
 * 		};
 * 	});
 * </script>
 *
 * <p>The time is {formatter.format(date)}</p>
 * ```
 */
class SvelteDate extends Date {
	#time = state(super.getTime());

	/** @type {Map<keyof Date, Source<unknown>>} */
	#deriveds = new Map();

	#reaction = active_reaction;

	/** @param {any[]} params */
	constructor(...params) {
		// @ts-ignore
		super(...params);

		if (!inited$1) this.#init();
	}

	#init() {
		inited$1 = true;

		var proto = SvelteDate.prototype;
		var date_proto = Date.prototype;

		var methods = /** @type {Array<keyof Date & string>} */ (
			Object.getOwnPropertyNames(date_proto)
		);

		for (const method of methods) {
			if (method.startsWith('get') || method.startsWith('to') || method === 'valueOf') {
				// @ts-ignore
				proto[method] = function (...args) {
					// don't memoize if there are arguments
					// @ts-ignore
					if (args.length > 0) {
						get(this.#time);
						// @ts-ignore
						return date_proto[method].apply(this, args);
					}

					var d = this.#deriveds.get(method);

					if (d === undefined) {
						// lazily create the derived, but as though it were being
						// created at the same time as the class instance
						const reaction = active_reaction;
						set_active_reaction(this.#reaction);

						d = user_derived(() => {
							get(this.#time);
							// @ts-ignore
							return date_proto[method].apply(this, args);
						});

						this.#deriveds.set(method, d);

						set_active_reaction(reaction);
					}

					return get(d);
				};
			}

			if (method.startsWith('set')) {
				// @ts-ignore
				proto[method] = function (...args) {
					// @ts-ignore
					var result = date_proto[method].apply(this, args);
					set(this.#time, date_proto.getTime.call(this));
					return result;
				};
			}
		}
	}
}

/** @import { Source } from '#client' */

var read_methods = ['forEach', 'isDisjointFrom', 'isSubsetOf', 'isSupersetOf'];
var set_like_methods = ['difference', 'intersection', 'symmetricDifference', 'union'];

var inited = false;

/**
 * A reactive version of the built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) object.
 * Reading contents of the set (by iterating, or by reading `set.size` or calling `set.has(...)` as in the [example](https://svelte.dev/playground/53438b51194b4882bcc18cddf9f96f15) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the set is updated.
 *
 * Note that values in a reactive set are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
 *
 * ```svelte
 * <script>
 * 	import { SvelteSet } from 'svelte/reactivity';
 * 	let monkeys = new SvelteSet();
 *
 * 	function toggle(monkey) {
 * 		if (monkeys.has(monkey)) {
 * 			monkeys.delete(monkey);
 * 		} else {
 * 			monkeys.add(monkey);
 * 		}
 * 	}
 * </script>
 *
 * {#each ['🙈', '🙉', '🙊'] as monkey}
 * 	<button onclick={() => toggle(monkey)}>{monkey}</button>
 * {/each}
 *
 * <button onclick={() => monkeys.clear()}>clear</button>
 *
 * {#if monkeys.has('🙈')}<p>see no evil</p>{/if}
 * {#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
 * {#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
 * ```
 *
 * @template T
 * @extends {Set<T>}
 */
class SvelteSet extends Set {
	/** @type {Map<T, Source<boolean>>} */
	#sources = new Map();
	#version = state(0);
	#size = state(0);
	#update_version = update_version || -1;

	/**
	 * @param {Iterable<T> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		if (value) {
			for (var element of value) {
				super.add(element);
			}
			this.#size.v = super.size;
		}

		if (!inited) this.#init();
	}

	/**
	 * If the source is being created inside the same reaction as the SvelteSet instance,
	 * we use `state` so that it will not be a dependency of the reaction. Otherwise we
	 * use `source` so it will be.
	 *
	 * @template T
	 * @param {T} value
	 * @returns {Source<T>}
	 */
	#source(value) {
		return update_version === this.#update_version ? state(value) : source(value);
	}

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		inited = true;

		var proto = SvelteSet.prototype;
		var set_proto = Set.prototype;

		for (const method of read_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				return set_proto[method].apply(this, v);
			};
		}

		for (const method of set_like_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				var set = /** @type {Set<T>} */ (set_proto[method].apply(this, v));
				return new SvelteSet(set);
			};
		}
	}

	/** @param {T} value */
	has(value) {
		var has = super.has(value);
		var sources = this.#sources;
		var s = sources.get(value);

		if (s === undefined) {
			if (!has) {
				// If the value doesn't exist, track the version in case it's added later
				// but don't create sources willy-nilly to track all possible values
				get(this.#version);
				return false;
			}

			s = this.#source(true);

			sources.set(value, s);
		}

		get(s);
		return has;
	}

	/** @param {T} value */
	add(value) {
		if (!super.has(value)) {
			super.add(value);
			set(this.#size, super.size);
			increment(this.#version);
		}

		return this;
	}

	/** @param {T} value */
	delete(value) {
		var deleted = super.delete(value);
		var sources = this.#sources;
		var s = sources.get(value);

		if (s !== undefined) {
			sources.delete(value);
			set(s, false);
		}

		if (deleted) {
			set(this.#size, super.size);
			increment(this.#version);
		}

		return deleted;
	}

	clear() {
		if (super.size === 0) {
			return;
		}
		// Clear first, so we get nice console.log outputs with $inspect
		super.clear();
		var sources = this.#sources;

		for (var s of sources.values()) {
			set(s, false);
		}

		sources.clear();
		set(this.#size, 0);
		increment(this.#version);
	}

	keys() {
		return this.values();
	}

	values() {
		get(this.#version);
		return super.values();
	}

	entries() {
		get(this.#version);
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.keys();
	}

	get size() {
		return get(this.#size);
	}
}

/** @import { Source } from '#client' */

/**
 * A reactive version of the built-in [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object.
 * Reading contents of the map (by iterating, or by reading `map.size` or calling `map.get(...)` or `map.has(...)` as in the [tic-tac-toe example](https://svelte.dev/playground/0b0ff4aa49c9443f9b47fe5203c78293) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the map is updated.
 *
 * Note that values in a reactive map are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
 *
 * ```svelte
 * <script>
 * 	import { SvelteMap } from 'svelte/reactivity';
 * 	import { result } from './game.js';
 *
 * 	let board = new SvelteMap();
 * 	let player = $state('x');
 * 	let winner = $derived(result(board));
 *
 * 	function reset() {
 * 		player = 'x';
 * 		board.clear();
 * 	}
 * </script>
 *
 * <div class="board">
 * 	{#each Array(9), i}
 * 		<button
 * 			disabled={board.has(i) || winner}
 * 			onclick={() => {
 * 				board.set(i, player);
 * 				player = player === 'x' ? 'o' : 'x';
 * 			}}
 * 		>{board.get(i)}</button>
 * 	{/each}
 * </div>
 *
 * {#if winner}
 * 	<p>{winner} wins!</p>
 * 	<button onclick={reset}>reset</button>
 * {:else}
 * 	<p>{player} is next</p>
 * {/if}
 * ```
 *
 * @template K
 * @template V
 * @extends {Map<K, V>}
 */
class SvelteMap extends Map {
	/** @type {Map<K, Source<number>>} */
	#sources = new Map();
	#version = state(0);
	#size = state(0);
	#update_version = update_version || -1;

	/**
	 * @param {Iterable<readonly [K, V]> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		if (value) {
			for (var [key, v] of value) {
				super.set(key, v);
			}
			this.#size.v = super.size;
		}
	}

	/**
	 * If the source is being created inside the same reaction as the SvelteMap instance,
	 * we use `state` so that it will not be a dependency of the reaction. Otherwise we
	 * use `source` so it will be.
	 *
	 * @template T
	 * @param {T} value
	 * @returns {Source<T>}
	 */
	#source(value) {
		return update_version === this.#update_version ? state(value) : source(value);
	}

	/** @param {K} key */
	has(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			var ret = super.get(key);
			if (ret !== undefined) {
				s = this.#source(0);

				sources.set(key, s);
			} else {
				// We should always track the version in case
				// the Set ever gets this value in the future.
				get(this.#version);
				return false;
			}
		}

		get(s);
		return true;
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	 * @param {any} [this_arg]
	 */
	forEach(callbackfn, this_arg) {
		this.#read_all();
		super.forEach(callbackfn, this_arg);
	}

	/** @param {K} key */
	get(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			var ret = super.get(key);
			if (ret !== undefined) {
				s = this.#source(0);

				sources.set(key, s);
			} else {
				// We should always track the version in case
				// the Set ever gets this value in the future.
				get(this.#version);
				return undefined;
			}
		}

		get(s);
		return super.get(key);
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);
		var prev_res = super.get(key);
		var res = super.set(key, value);
		var version = this.#version;

		if (s === undefined) {
			s = this.#source(0);

			sources.set(key, s);
			set(this.#size, super.size);
			increment(version);
		} else if (prev_res !== value) {
			increment(s);

			// if not every reaction of s is a reaction of version we need to also include version
			var v_reactions = version.reactions === null ? null : new Set(version.reactions);
			var needs_version_increase =
				v_reactions === null ||
				!s.reactions?.every((r) =>
					/** @type {NonNullable<typeof v_reactions>} */ (v_reactions).has(r)
				);
			if (needs_version_increase) {
				increment(version);
			}
		}

		return res;
	}

	/** @param {K} key */
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		var res = super.delete(key);

		if (s !== undefined) {
			sources.delete(key);
			set(this.#size, super.size);
			set(s, -1);
			increment(this.#version);
		}

		return res;
	}

	clear() {
		if (super.size === 0) {
			return;
		}
		// Clear first, so we get nice console.log outputs with $inspect
		super.clear();
		var sources = this.#sources;
		set(this.#size, 0);
		for (var s of sources.values()) {
			set(s, -1);
		}
		increment(this.#version);
		sources.clear();
	}

	#read_all() {
		get(this.#version);

		var sources = this.#sources;
		if (this.#size.v !== sources.size) {
			for (var key of super.keys()) {
				if (!sources.has(key)) {
					var s = this.#source(0);

					sources.set(key, s);
				}
			}
		}

		for ([, s] of this.#sources) {
			get(s);
		}
	}

	keys() {
		get(this.#version);
		return super.keys();
	}

	values() {
		this.#read_all();
		return super.values();
	}

	entries() {
		this.#read_all();
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		get(this.#size);
		return super.size;
	}
}

const REPLACE = Symbol();

/**
 * A reactive version of the built-in [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object.
 * Reading its contents (by iterating, or by calling `params.get(...)` or `params.getAll(...)` as in the [example](https://svelte.dev/playground/b3926c86c5384bab9f2cf993bc08c1c8) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the params are updated.
 *
 * ```svelte
 * <script>
 * 	import { SvelteURLSearchParams } from 'svelte/reactivity';
 *
 * 	const params = new SvelteURLSearchParams('message=hello');
 *
 * 	let key = $state('key');
 * 	let value = $state('value');
 * </script>
 *
 * <input bind:value={key} />
 * <input bind:value={value} />
 * <button onclick={() => params.append(key, value)}>append</button>
 *
 * <p>?{params.toString()}</p>
 *
 * {#each params as [key, value]}
 * 	<p>{key}: {value}</p>
 * {/each}
 * ```
 */
class SvelteURLSearchParams extends URLSearchParams {
	#version = state(0);
	#url = get_current_url();

	#updating = false;

	#update_url() {
		if (!this.#url || this.#updating) return;
		this.#updating = true;

		const search = this.toString();
		this.#url.search = search && `?${search}`;

		this.#updating = false;
	}

	/**
	 * @param {URLSearchParams} params
	 * @internal
	 */
	[REPLACE](params) {
		if (this.#updating) return;
		this.#updating = true;

		for (const key of [...super.keys()]) {
			super.delete(key);
		}

		for (const [key, value] of params) {
			super.append(key, value);
		}

		increment(this.#version);
		this.#updating = false;
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	append(name, value) {
		super.append(name, value);
		this.#update_url();
		increment(this.#version);
	}

	/**
	 * @param {string} name
	 * @param {string=} value
	 * @returns {void}
	 */
	delete(name, value) {
		var has_value = super.has(name, value);
		super.delete(name, value);
		if (has_value) {
			this.#update_url();
			increment(this.#version);
		}
	}

	/**
	 * @param {string} name
	 * @returns {string|null}
	 */
	get(name) {
		get(this.#version);
		return super.get(name);
	}

	/**
	 * @param {string} name
	 * @returns {string[]}
	 */
	getAll(name) {
		get(this.#version);
		return super.getAll(name);
	}

	/**
	 * @param {string} name
	 * @param {string=} value
	 * @returns {boolean}
	 */
	has(name, value) {
		get(this.#version);
		return super.has(name, value);
	}

	keys() {
		get(this.#version);
		return super.keys();
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	set(name, value) {
		var previous = super.getAll(name).join('');
		super.set(name, value);
		// can't use has(name, value), because for something like https://svelte.dev?foo=1&bar=2&foo=3
		// if you set `foo` to 1, then foo=3 gets deleted whilst `has("foo", "1")` returns true
		if (previous !== super.getAll(name).join('')) {
			this.#update_url();
			increment(this.#version);
		}
	}

	sort() {
		super.sort();
		this.#update_url();
		increment(this.#version);
	}

	toString() {
		get(this.#version);
		return super.toString();
	}

	values() {
		get(this.#version);
		return super.values();
	}

	entries() {
		get(this.#version);
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		get(this.#version);
		return super.size;
	}
}

/** @type {SvelteURL | null} */
let current_url = null;

function get_current_url() {
	// ideally we'd just export `current_url` directly, but it seems Vitest doesn't respect live bindings
	return current_url;
}

/**
 * A reactive version of the built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) object.
 * Reading properties of the URL (such as `url.href` or `url.pathname`) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the URL changes.
 *
 * The `searchParams` property is an instance of [SvelteURLSearchParams](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteURLSearchParams).
 *
 * [Example](https://svelte.dev/playground/5a694758901b448c83dc40dc31c71f2a):
 *
 * ```svelte
 * <script>
 * 	import { SvelteURL } from 'svelte/reactivity';
 *
 * 	const url = new SvelteURL('https://example.com/path');
 * </script>
 *
 * <!-- changes to these... -->
 * <input bind:value={url.protocol} />
 * <input bind:value={url.hostname} />
 * <input bind:value={url.pathname} />
 *
 * <hr />
 *
 * <!-- will update `href` and vice versa -->
 * <input bind:value={url.href} size="65" />
 * ```
 */
class SvelteURL extends URL {
	#protocol = state(super.protocol);
	#username = state(super.username);
	#password = state(super.password);
	#hostname = state(super.hostname);
	#port = state(super.port);
	#pathname = state(super.pathname);
	#hash = state(super.hash);
	#search = state(super.search);
	#searchParams;

	/**
	 * @param {string | URL} url
	 * @param {string | URL} [base]
	 */
	constructor(url, base) {
		url = new URL(url, base);
		super(url);

		current_url = this;
		this.#searchParams = new SvelteURLSearchParams(url.searchParams);
		current_url = null;
	}

	get hash() {
		return get(this.#hash);
	}

	set hash(value) {
		super.hash = value;
		set(this.#hash, super.hash);
	}

	get host() {
		get(this.#hostname);
		get(this.#port);
		return super.host;
	}

	set host(value) {
		super.host = value;
		set(this.#hostname, super.hostname);
		set(this.#port, super.port);
	}

	get hostname() {
		return get(this.#hostname);
	}

	set hostname(value) {
		super.hostname = value;
		set(this.#hostname, super.hostname);
	}

	get href() {
		get(this.#protocol);
		get(this.#username);
		get(this.#password);
		get(this.#hostname);
		get(this.#port);
		get(this.#pathname);
		get(this.#hash);
		get(this.#search);
		return super.href;
	}

	set href(value) {
		super.href = value;
		set(this.#protocol, super.protocol);
		set(this.#username, super.username);
		set(this.#password, super.password);
		set(this.#hostname, super.hostname);
		set(this.#port, super.port);
		set(this.#pathname, super.pathname);
		set(this.#hash, super.hash);
		set(this.#search, super.search);
		this.#searchParams[REPLACE](super.searchParams);
	}

	get password() {
		return get(this.#password);
	}

	set password(value) {
		super.password = value;
		set(this.#password, super.password);
	}

	get pathname() {
		return get(this.#pathname);
	}

	set pathname(value) {
		super.pathname = value;
		set(this.#pathname, super.pathname);
	}

	get port() {
		return get(this.#port);
	}

	set port(value) {
		super.port = value;
		set(this.#port, super.port);
	}

	get protocol() {
		return get(this.#protocol);
	}

	set protocol(value) {
		super.protocol = value;
		set(this.#protocol, super.protocol);
	}

	get search() {
		return get(this.#search);
	}

	set search(value) {
		super.search = value;
		set(this.#search, value);
		this.#searchParams[REPLACE](super.searchParams);
	}

	get username() {
		return get(this.#username);
	}

	set username(value) {
		super.username = value;
		set(this.#username, super.username);
	}

	get origin() {
		get(this.#protocol);
		get(this.#hostname);
		get(this.#port);
		return super.origin;
	}

	get searchParams() {
		return this.#searchParams;
	}

	toString() {
		return this.href;
	}

	toJSON() {
		return this.href;
	}
}

export { SvelteDate, SvelteMap, SvelteSet, SvelteURL, SvelteURLSearchParams };

import { c as async_mode_flag, l as legacy_mode_flag, t as tracing_mode_flag } from './index-DZuH9089.js';
import { g as HYDRATION_ERROR, b as HYDRATION_END, H as HYDRATION_START, a as HYDRATION_START_ELSE, F as FILENAME, U as UNINITIALIZED } from './constants-BMyj1h3a.js';

var DEV = false;

// Store the references to globals in case someone tries to monkey patch these, causing the below
// to de-opt (this occurs often when using popular extensions).
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var array_from = Array.from;
var object_keys = Object.keys;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;

/**
 * @param {any} thing
 * @returns {thing is Function}
 */
function is_function(thing) {
	return typeof thing === 'function';
}

const noop = () => {};

// Adapted from https://github.com/then/is-promise/blob/master/index.js
// Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE

/**
 * @template [T=any]
 * @param {any} value
 * @returns {value is PromiseLike<T>}
 */
function is_promise(value) {
	return typeof value?.then === 'function';
}

/** @param {Function} fn */
function run$1(fn) {
	return fn();
}

/** @param {Array<() => void>} arr */
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i]();
	}
}

/**
 * TODO replace with Promise.withResolvers once supported widely enough
 * @template T
 */
function deferred() {
	/** @type {(value: T) => void} */
	var resolve;

	/** @type {(reason: any) => void} */
	var reject;

	/** @type {Promise<T>} */
	var promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});

	// @ts-expect-error
	return { promise, resolve, reject };
}

/**
 * @template V
 * @param {V} value
 * @param {V | (() => V)} fallback
 * @param {boolean} [lazy]
 * @returns {V}
 */
function fallback(value, fallback, lazy = false) {
	return value === undefined
		? lazy
			? /** @type {() => V} */ (fallback)()
			: /** @type {V} */ (fallback)
		: value;
}

/**
 * When encountering a situation like `let [a, b, c] = $derived(blah())`,
 * we need to stash an intermediate value that `a`, `b`, and `c` derive
 * from, in case it's an iterable
 * @template T
 * @param {ArrayLike<T> | Iterable<T>} value
 * @param {number} [n]
 * @returns {Array<T>}
 */
function to_array(value, n) {
	// return arrays unchanged
	if (Array.isArray(value)) {
		return value;
	}

	// if value is not iterable, or `n` is unspecified (indicates a rest
	// element, which means we're not concerned about unbounded iterables)
	// convert to an array with `Array.from`
	if (n === undefined || !(Symbol.iterator in value)) {
		return Array.from(value);
	}

	// otherwise, populate an array with `n` values

	/** @type {T[]} */
	const array = [];

	for (const element of value) {
		array.push(element);
		if (array.length === n) break;
	}

	return array;
}

// General flags
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const BOUNDARY_EFFECT = 1 << 7;
/**
 * Indicates that a reaction is connected to an effect root — either it is an effect,
 * or it is a derived that is depended on by at least one effect. If a derived has
 * no dependents, we can disconnect it from the graph, allowing it to either be
 * GC'd or reconnected later if an effect comes to depend on it again
 */
const CONNECTED = 1 << 9;
const CLEAN = 1 << 10;
const DIRTY = 1 << 11;
const MAYBE_DIRTY = 1 << 12;
const INERT = 1 << 13;
const DESTROYED = 1 << 14;

// Flags exclusive to effects
/** Set once an effect that should run synchronously has run */
const EFFECT_RAN = 1 << 15;
/**
 * 'Transparent' effects do not create a transition boundary.
 * This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
 */
const EFFECT_TRANSPARENT = 1 << 16;
const EAGER_EFFECT = 1 << 17;
const HEAD_EFFECT = 1 << 18;
const EFFECT_PRESERVED = 1 << 19;
const USER_EFFECT = 1 << 20;

// Flags exclusive to deriveds
/**
 * Tells that we marked this derived and its reactions as visited during the "mark as (maybe) dirty"-phase.
 * Will be lifted during execution of the derived and during checking its dirty state (both are necessary
 * because a derived might be checked but not executed).
 */
const WAS_MARKED = 1 << 15;

// Flags used for async
const REACTION_IS_UPDATING = 1 << 21;
const ASYNC = 1 << 22;

const ERROR_VALUE = 1 << 23;

const STATE_SYMBOL = Symbol('$state');
const LEGACY_PROPS = Symbol('legacy props');
const LOADING_ATTR_SYMBOL = Symbol('');
const PROXY_PATH_SYMBOL = Symbol('proxy path');

/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
const STALE_REACTION = new (class StaleReactionError extends Error {
	name = 'StaleReactionError';
	message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
})();

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const DOCUMENT_FRAGMENT_NODE = 11;

/* This file is generated by scripts/process-messages/index.js. Do not edit! */


/**
 * Cannot use `{@render children(...)}` if the parent component uses `let:` directives. Consider using a named snippet instead
 * @returns {never}
 */
function invalid_default_snippet() {
	{
		throw new Error(`https://svelte.dev/e/invalid_default_snippet`);
	}
}

/**
 * A snippet function was passed invalid arguments. Snippets should only be instantiated via `{@render ...}`
 * @returns {never}
 */
function invalid_snippet_arguments() {
	{
		throw new Error(`https://svelte.dev/e/invalid_snippet_arguments`);
	}
}

/**
 * `%name%(...)` can only be used during component initialisation
 * @param {string} name
 * @returns {never}
 */
function lifecycle_outside_component(name) {
	{
		throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
	}
}

/**
 * Context was not set in a parent component
 * @returns {never}
 */
function missing_context() {
	{
		throw new Error(`https://svelte.dev/e/missing_context`);
	}
}

/**
 * Attempted to render a snippet without a `{@render}` block. This would cause the snippet code to be stringified instead of its content being rendered to the DOM. To fix this, change `{snippet}` to `{@render snippet()}`.
 * @returns {never}
 */
function snippet_without_render_tag() {
	{
		throw new Error(`https://svelte.dev/e/snippet_without_render_tag`);
	}
}

/**
 * `%name%` is not a store with a `subscribe` method
 * @param {string} name
 * @returns {never}
 */
function store_invalid_shape(name) {
	{
		throw new Error(`https://svelte.dev/e/store_invalid_shape`);
	}
}

/**
 * The `this` prop on `<svelte:element>` must be a string, if defined
 * @returns {never}
 */
function svelte_element_invalid_this_value() {
	{
		throw new Error(`https://svelte.dev/e/svelte_element_invalid_this_value`);
	}
}

/* This file is generated by scripts/process-messages/index.js. Do not edit! */


/**
 * Cannot create a `$derived(...)` with an `await` expression outside of an effect tree
 * @returns {never}
 */
function async_derived_orphan() {
	{
		throw new Error(`https://svelte.dev/e/async_derived_orphan`);
	}
}

/**
 * Calling `%method%` on a component instance (of %component%) is no longer valid in Svelte 5
 * @param {string} method
 * @param {string} component
 * @returns {never}
 */
function component_api_changed(method, component) {
	{
		throw new Error(`https://svelte.dev/e/component_api_changed`);
	}
}

/**
 * Attempted to instantiate %component% with `new %name%`, which is no longer valid in Svelte 5. If this component is not under your control, set the `compatibility.componentApi` compiler option to `4` to keep it working.
 * @param {string} component
 * @param {string} name
 * @returns {never}
 */
function component_api_invalid_new(component, name) {
	{
		throw new Error(`https://svelte.dev/e/component_api_invalid_new`);
	}
}

/**
 * Keyed each block has duplicate key `%value%` at indexes %a% and %b%
 * @param {string} a
 * @param {string} b
 * @param {string | undefined | null} [value]
 * @returns {never}
 */
function each_key_duplicate(a, b, value) {
	{
		throw new Error(`https://svelte.dev/e/each_key_duplicate`);
	}
}

/**
 * `%rune%` cannot be used inside an effect cleanup function
 * @param {string} rune
 * @returns {never}
 */
function effect_in_teardown(rune) {
	{
		throw new Error(`https://svelte.dev/e/effect_in_teardown`);
	}
}

/**
 * Effect cannot be created inside a `$derived` value that was not itself created inside an effect
 * @returns {never}
 */
function effect_in_unowned_derived() {
	{
		throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
	}
}

/**
 * `%rune%` can only be used inside an effect (e.g. during component initialisation)
 * @param {string} rune
 * @returns {never}
 */
function effect_orphan(rune) {
	{
		throw new Error(`https://svelte.dev/e/effect_orphan`);
	}
}

/**
 * `$effect.pending()` can only be called inside an effect or derived
 * @returns {never}
 */
function effect_pending_outside_reaction() {
	{
		throw new Error(`https://svelte.dev/e/effect_pending_outside_reaction`);
	}
}

/**
 * Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
 * @returns {never}
 */
function effect_update_depth_exceeded() {
	{
		throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
	}
}

/**
 * Cannot use `fork(...)` unless the `experimental.async` compiler option is `true`
 * @returns {never}
 */
function experimental_async_fork() {
	{
		throw new Error(`https://svelte.dev/e/experimental_async_fork`);
	}
}

/**
 * Cannot use `flushSync` inside an effect
 * @returns {never}
 */
function flush_sync_in_effect() {
	{
		throw new Error(`https://svelte.dev/e/flush_sync_in_effect`);
	}
}

/**
 * Cannot commit a fork that was already discarded
 * @returns {never}
 */
function fork_discarded() {
	{
		throw new Error(`https://svelte.dev/e/fork_discarded`);
	}
}

/**
 * Cannot create a fork inside an effect or when state changes are pending
 * @returns {never}
 */
function fork_timing() {
	{
		throw new Error(`https://svelte.dev/e/fork_timing`);
	}
}

/**
 * `getAbortSignal()` can only be called inside an effect or derived
 * @returns {never}
 */
function get_abort_signal_outside_reaction() {
	{
		throw new Error(`https://svelte.dev/e/get_abort_signal_outside_reaction`);
	}
}

/**
 * Failed to hydrate the application
 * @returns {never}
 */
function hydration_failed() {
	{
		throw new Error(`https://svelte.dev/e/hydration_failed`);
	}
}

/**
 * `%name%(...)` cannot be used in runes mode
 * @param {string} name
 * @returns {never}
 */
function lifecycle_legacy_only(name) {
	{
		throw new Error(`https://svelte.dev/e/lifecycle_legacy_only`);
	}
}

/**
 * Cannot do `bind:%key%={undefined}` when `%key%` has a fallback value
 * @param {string} key
 * @returns {never}
 */
function props_invalid_value(key) {
	{
		throw new Error(`https://svelte.dev/e/props_invalid_value`);
	}
}

/**
 * `setContext` must be called when a component first initializes, not in a subsequent effect or after an `await` expression
 * @returns {never}
 */
function set_context_after_init() {
	{
		throw new Error(`https://svelte.dev/e/set_context_after_init`);
	}
}

/**
 * Property descriptors defined on `$state` objects must contain `value` and always be `enumerable`, `configurable` and `writable`.
 * @returns {never}
 */
function state_descriptors_fixed() {
	{
		throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
	}
}

/**
 * Cannot set prototype of `$state` object
 * @returns {never}
 */
function state_prototype_fixed() {
	{
		throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
	}
}

/**
 * Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
 * @returns {never}
 */
function state_unsafe_mutation() {
	{
		throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
	}
}

/**
 * A `<svelte:boundary>` `reset` function cannot be called while an error is still being handled
 * @returns {never}
 */
function svelte_boundary_reset_onerror() {
	{
		throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
	}
}

/* This file is generated by scripts/process-messages/index.js. Do not edit! */


/**
 * Assignment to `%property%` property (%location%) will evaluate to the right-hand side, not the value of `%property%` following the assignment. This may result in unexpected behaviour.
 * @param {string} property
 * @param {string} location
 */
function assignment_value_stale(property, location) {
	{
		console.warn(`https://svelte.dev/e/assignment_value_stale`);
	}
}

/**
 * `%binding%` (%location%) is binding to a non-reactive property
 * @param {string} binding
 * @param {string | undefined | null} [location]
 */
function binding_property_non_reactive(binding, location) {
	{
		console.warn(`https://svelte.dev/e/binding_property_non_reactive`);
	}
}

/**
 * Your `console.%method%` contained `$state` proxies. Consider using `$inspect(...)` or `$state.snapshot(...)` instead
 * @param {string} method
 */
function console_log_state(method) {
	{
		console.warn(`https://svelte.dev/e/console_log_state`);
	}
}

/**
 * %handler% should be a function. Did you mean to %suggestion%?
 * @param {string} handler
 * @param {string} suggestion
 */
function event_handler_invalid(handler, suggestion) {
	{
		console.warn(`https://svelte.dev/e/event_handler_invalid`);
	}
}

/**
 * Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near %location%
 * @param {string | undefined | null} [location]
 */
function hydration_mismatch(location) {
	{
		console.warn(`https://svelte.dev/e/hydration_mismatch`);
	}
}

/**
 * Detected a migrated `$:` reactive block in `%filename%` that both accesses and updates the same reactive value. This may cause recursive updates when converted to an `$effect`.
 * @param {string} filename
 */
function legacy_recursive_reactive_block(filename) {
	{
		console.warn(`https://svelte.dev/e/legacy_recursive_reactive_block`);
	}
}

/**
 * %parent% passed property `%prop%` to %child% with `bind:`, but its parent component %owner% did not declare `%prop%` as a binding. Consider creating a binding between %owner% and %parent% (e.g. `bind:%prop%={...}` instead of `%prop%={...}`)
 * @param {string} parent
 * @param {string} prop
 * @param {string} child
 * @param {string} owner
 */
function ownership_invalid_binding(parent, prop, child, owner) {
	{
		console.warn(`https://svelte.dev/e/ownership_invalid_binding`);
	}
}

/**
 * Mutating unbound props (`%name%`, at %location%) is strongly discouraged. Consider using `bind:%prop%={...}` in %parent% (or using a callback) instead
 * @param {string} name
 * @param {string} location
 * @param {string} prop
 * @param {string} parent
 */
function ownership_invalid_mutation(name, location, prop, parent) {
	{
		console.warn(`https://svelte.dev/e/ownership_invalid_mutation`);
	}
}

/**
 * The `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.
 */
function select_multiple_invalid_value() {
	{
		console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
	}
}

/**
 * Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `%operator%` will produce unexpected results
 * @param {string} operator
 */
function state_proxy_equality_mismatch(operator) {
	{
		console.warn(`https://svelte.dev/e/state_proxy_equality_mismatch`);
	}
}

/**
 * A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called
 */
function svelte_boundary_reset_noop() {
	{
		console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
	}
}

/** @import { TemplateNode } from '#client' */


/**
 * Use this variable to guard everything related to hydration code so it can be treeshaken out
 * if the user doesn't use the `hydrate` method and these code paths are therefore not needed.
 */
let hydrating = false;

/** @param {boolean} value */
function set_hydrating(value) {
	hydrating = value;
}

/**
 * The node that is currently being hydrated. This starts out as the first node inside the opening
 * <!--[--> comment, and updates each time a component calls `$.child(...)` or `$.sibling(...)`.
 * When entering a block (e.g. `{#if ...}`), `hydrate_node` is the block opening comment; by the
 * time we leave the block it is the closing comment, which serves as the block's anchor.
 * @type {TemplateNode}
 */
let hydrate_node;

/** @param {TemplateNode} node */
function set_hydrate_node(node) {
	if (node === null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}

	return (hydrate_node = node);
}

function hydrate_next() {
	return set_hydrate_node(/** @type {TemplateNode} */ (get_next_sibling(hydrate_node)));
}

/** @param {TemplateNode} node */
function reset(node) {
	if (!hydrating) return;

	// If the node has remaining siblings, something has gone wrong
	if (get_next_sibling(hydrate_node) !== null) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}

	hydrate_node = node;
}

/**
 * @param {HTMLTemplateElement} template
 */
function hydrate_template(template) {
	if (hydrating) {
		// @ts-expect-error TemplateNode doesn't include DocumentFragment, but it's actually fine
		hydrate_node = template.content;
	}
}

function next(count = 1) {
	if (hydrating) {
		var i = count;
		var node = hydrate_node;

		while (i--) {
			node = /** @type {TemplateNode} */ (get_next_sibling(node));
		}

		hydrate_node = node;
	}
}

/**
 * Skips or removes (depending on {@link remove}) all nodes starting at `hydrate_node` up until the next hydration end comment
 * @param {boolean} remove
 */
function skip_nodes(remove = true) {
	var depth = 0;
	var node = hydrate_node;

	while (true) {
		if (node.nodeType === COMMENT_NODE) {
			var data = /** @type {Comment} */ (node).data;

			if (data === HYDRATION_END) {
				if (depth === 0) return node;
				depth -= 1;
			} else if (data === HYDRATION_START || data === HYDRATION_START_ELSE) {
				depth += 1;
			}
		}

		var next = /** @type {TemplateNode} */ (get_next_sibling(node));
		if (remove) node.remove();
		node = next;
	}
}

/**
 *
 * @param {TemplateNode} node
 */
function read_hydration_instruction(node) {
	if (!node || node.nodeType !== COMMENT_NODE) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}

	return /** @type {Comment} */ (node).data;
}

/** @import { Equals } from '#client' */

/** @type {Equals} */
function equals(value) {
	return value === this.v;
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
function safe_not_equal(a, b) {
	return a != a
		? b == b
		: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
}

/** @type {Equals} */
function safe_equals(value) {
	return !safe_not_equal(value, this.v);
}

/** @import { ComponentContext, DevStackEntry, Effect } from '#client' */

/** @type {ComponentContext | null} */
let component_context = null;

/** @param {ComponentContext | null} context */
function set_component_context(context) {
	component_context = context;
}

/** @type {DevStackEntry | null} */
let dev_stack = null;

/**
 * Execute a callback with a new dev stack entry
 * @param {() => any} callback - Function to execute
 * @param {DevStackEntry['type']} type - Type of block/component
 * @param {any} component - Component function
 * @param {number} line - Line number
 * @param {number} column - Column number
 * @param {Record<string, any>} [additional] - Any additional properties to add to the dev stack entry
 * @returns {any}
 */
function add_svelte_meta(callback, type, component, line, column, additional) {
	const parent = dev_stack;

	dev_stack = {
		type,
		file: component[FILENAME],
		line,
		column,
		parent,
		...additional
	};

	try {
		return callback();
	} finally {
		dev_stack = parent;
	}
}

/**
 * The current component function. Different from current component context:
 * ```html
 * <!-- App.svelte -->
 * <Foo>
 *   <Bar /> <!-- context == Foo.svelte, function == App.svelte -->
 * </Foo>
 * ```
 * @type {ComponentContext['function']}
 */
let dev_current_component_function = null;

/** @param {ComponentContext['function']} fn */
function set_dev_current_component_function(fn) {
	dev_current_component_function = fn;
}

/**
 * Returns a `[get, set]` pair of functions for working with context in a type-safe way.
 *
 * `get` will throw an error if no parent component called `set`.
 *
 * @template T
 * @returns {[() => T, (context: T) => T]}
 * @since 5.40.0
 */
function createContext() {
	const key = {};

	return [
		() => {
			if (!hasContext(key)) {
				missing_context();
			}

			return getContext(key);
		},
		(context) => setContext(key, context)
	];
}

/**
 * Retrieves the context that belongs to the closest parent component with the specified `key`.
 * Must be called during component initialisation.
 *
 * [`createContext`](https://svelte.dev/docs/svelte/svelte#createContext) is a type-safe alternative.
 *
 * @template T
 * @param {any} key
 * @returns {T}
 */
function getContext(key) {
	const context_map = get_or_init_context_map();
	const result = /** @type {T} */ (context_map.get(key));
	return result;
}

/**
 * Associates an arbitrary `context` object with the current component and the specified `key`
 * and returns that object. The context is then available to children of the component
 * (including slotted content) with `getContext`.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 *
 * [`createContext`](https://svelte.dev/docs/svelte/svelte#createContext) is a type-safe alternative.
 *
 * @template T
 * @param {any} key
 * @param {T} context
 * @returns {T}
 */
function setContext(key, context) {
	const context_map = get_or_init_context_map();

	if (async_mode_flag) {
		var flags = /** @type {Effect} */ (active_effect).f;
		var valid =
			!active_reaction &&
			(flags & BRANCH_EFFECT) !== 0 &&
			// pop() runs synchronously, so this indicates we're setting context after an await
			!(/** @type {ComponentContext} */ (component_context).i);

		if (!valid) {
			set_context_after_init();
		}
	}

	context_map.set(key, context);
	return context;
}

/**
 * Checks whether a given `key` has been set in the context of a parent component.
 * Must be called during component initialisation.
 *
 * @param {any} key
 * @returns {boolean}
 */
function hasContext(key) {
	const context_map = get_or_init_context_map();
	return context_map.has(key);
}

/**
 * Retrieves the whole context map that belongs to the closest parent component.
 * Must be called during component initialisation. Useful, for example, if you
 * programmatically create a component and want to pass the existing context to it.
 *
 * @template {Map<any, any>} [T=Map<any, any>]
 * @returns {T}
 */
function getAllContexts() {
	const context_map = get_or_init_context_map();
	return /** @type {T} */ (context_map);
}

/**
 * @param {Record<string, unknown>} props
 * @param {any} runes
 * @param {Function} [fn]
 * @returns {void}
 */
function push(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
	};
}

/**
 * @template {Record<string, any>} T
 * @param {T} [component]
 * @returns {T}
 */
function pop(component) {
	var context = /** @type {ComponentContext} */ (component_context);
	var effects = context.e;

	if (effects !== null) {
		context.e = null;

		for (var fn of effects) {
			create_user_effect(fn);
		}
	}

	if (component !== undefined) {
		context.x = component;
	}

	context.i = true;

	component_context = context.p;

	return component ?? /** @type {T} */ ({});
}

/** @returns {boolean} */
function is_runes() {
	return !legacy_mode_flag || (component_context !== null && component_context.l === null);
}

/**
 * @param {string} name
 * @returns {Map<unknown, unknown>}
 */
function get_or_init_context_map(name) {
	if (component_context === null) {
		lifecycle_outside_component();
	}

	return (component_context.c ??= new Map(get_parent_context(component_context) || undefined));
}

/**
 * @param {ComponentContext} component_context
 * @returns {Map<unknown, unknown> | null}
 */
function get_parent_context(component_context) {
	let parent = component_context.p;
	while (parent !== null) {
		const context_map = parent.c;
		if (context_map !== null) {
			return context_map;
		}
		parent = parent.p;
	}
	return null;
}

/** @type {Array<() => void>} */
let micro_tasks = [];

function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}

/**
 * @param {() => void} fn
 */
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			// If this is false, a flushSync happened in the meantime. Do _not_ run new scheduled microtasks in that case
			// as the ordering of microtasks would be broken at that point - consider this case:
			// - queue_micro_task schedules microtask A to flush task X
			// - synchronously after, flushSync runs, processing task X
			// - synchronously after, some other microtask B is scheduled, but not through queue_micro_task but for example a Promise.resolve() in user code
			// - synchronously after, queue_micro_task schedules microtask C to flush task Y
			// - one tick later, microtask A now resolves, flushing task Y before microtask B, which is incorrect
			// This if check prevents that race condition (that realistically will only happen in tests)
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}

	micro_tasks.push(fn);
}

/**
 * Synchronously run any queued tasks.
 */
function flush_tasks() {
	while (micro_tasks.length > 0) {
		run_micro_tasks();
	}
}

/** @import { Derived, Effect } from '#client' */
/** @import { Boundary } from './dom/blocks/boundary.js' */

/**
 * @param {unknown} error
 */
function handle_error(error) {
	var effect = active_effect;

	// for unowned deriveds, don't throw until we read the value
	if (effect === null) {
		/** @type {Derived} */ (active_reaction).f |= ERROR_VALUE;
		return error;
	}

	if ((effect.f & EFFECT_RAN) === 0) {
		// if the error occurred while creating this subtree, we let it
		// bubble up until it hits a boundary that can handle it
		if ((effect.f & BOUNDARY_EFFECT) === 0) {

			throw error;
		}

		/** @type {Boundary} */ (effect.b).error(error);
	} else {
		// otherwise we bubble up the effect tree ourselves
		invoke_error_boundary(error, effect);
	}
}

/**
 * @param {unknown} error
 * @param {Effect | null} effect
 */
function invoke_error_boundary(error, effect) {
	while (effect !== null) {
		if ((effect.f & BOUNDARY_EFFECT) !== 0) {
			try {
				/** @type {Boundary} */ (effect.b).error(error);
				return;
			} catch (e) {
				error = e;
			}
		}

		effect = effect.parent;
	}

	throw error;
}

/** @import { Fork } from 'svelte' */
/** @import { Derived, Effect, Reaction, Source, Value } from '#client' */

/**
 * @typedef {{
 *   parent: EffectTarget | null;
 *   effect: Effect | null;
 *   effects: Effect[];
 *   render_effects: Effect[];
 *   block_effects: Effect[];
 * }} EffectTarget
 */

/** @type {Set<Batch>} */
const batches = new Set();

/** @type {Batch | null} */
let current_batch = null;

/**
 * This is needed to avoid overwriting inputs in non-async mode
 * TODO 6.0 remove this, as non-async mode will go away
 * @type {Batch | null}
 */
let previous_batch = null;

/**
 * When time travelling (i.e. working in one batch, while other batches
 * still have ongoing work), we ignore the real values of affected
 * signals in favour of their values within the batch
 * @type {Map<Value, any> | null}
 */
let batch_values = null;

/** @type {Effect[]} */
let queued_root_effects = [];

/** @type {Effect | null} */
let last_scheduled_effect = null;

let is_flushing = false;
let is_flushing_sync = false;

class Batch {
	committed = false;

	/**
	 * The current values of any sources that are updated in this batch
	 * They keys of this map are identical to `this.#previous`
	 * @type {Map<Source, any>}
	 */
	current = new Map();

	/**
	 * The values of any sources that are updated in this batch _before_ those updates took place.
	 * They keys of this map are identical to `this.#current`
	 * @type {Map<Source, any>}
	 */
	previous = new Map();

	/**
	 * When the batch is committed (and the DOM is updated), we need to remove old branches
	 * and append new ones by calling the functions added inside (if/each/key/etc) blocks
	 * @type {Set<() => void>}
	 */
	#commit_callbacks = new Set();

	/**
	 * If a fork is discarded, we need to destroy any effects that are no longer needed
	 * @type {Set<(batch: Batch) => void>}
	 */
	#discard_callbacks = new Set();

	/**
	 * The number of async effects that are currently in flight
	 */
	#pending = 0;

	/**
	 * The number of async effects that are currently in flight, _not_ inside a pending boundary
	 */
	#blocking_pending = 0;

	/**
	 * A deferred that resolves when the batch is committed, used with `settled()`
	 * TODO replace with Promise.withResolvers once supported widely enough
	 * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
	 */
	#deferred = null;

	/**
	 * Deferred effects (which run after async work has completed) that are DIRTY
	 * @type {Effect[]}
	 */
	#dirty_effects = [];

	/**
	 * Deferred effects that are MAYBE_DIRTY
	 * @type {Effect[]}
	 */
	#maybe_dirty_effects = [];

	/**
	 * A set of branches that still exist, but will be destroyed when this batch
	 * is committed — we skip over these during `process`
	 * @type {Set<Effect>}
	 */
	skipped_effects = new Set();

	is_fork = false;

	/**
	 *
	 * @param {Effect[]} root_effects
	 */
	process(root_effects) {
		queued_root_effects = [];

		previous_batch = null;

		this.apply();

		/** @type {EffectTarget} */
		var target = {
			parent: null,
			effect: null,
			effects: [],
			render_effects: [],
			block_effects: []
		};

		for (const root of root_effects) {
			this.#traverse_effect_tree(root, target);
		}

		if (!this.is_fork) {
			this.#resolve();
		}

		if (this.#blocking_pending > 0 || this.is_fork) {
			this.#defer_effects(target.effects);
			this.#defer_effects(target.render_effects);
			this.#defer_effects(target.block_effects);
		} else {
			// If sources are written to, then work needs to happen in a separate batch, else prior sources would be mixed with
			// newly updated sources, which could lead to infinite loops when effects run over and over again.
			previous_batch = this;
			current_batch = null;

			flush_queued_effects(target.render_effects);
			flush_queued_effects(target.effects);

			previous_batch = null;

			this.#deferred?.resolve();
		}

		batch_values = null;
	}

	/**
	 * Traverse the effect tree, executing effects or stashing
	 * them for later execution as appropriate
	 * @param {Effect} root
	 * @param {EffectTarget} target
	 */
	#traverse_effect_tree(root, target) {
		root.f ^= CLEAN;

		var effect = root.first;

		while (effect !== null) {
			var flags = effect.f;
			var is_branch = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
			var is_skippable_branch = is_branch && (flags & CLEAN) !== 0;

			var skip = is_skippable_branch || (flags & INERT) !== 0 || this.skipped_effects.has(effect);

			if ((effect.f & BOUNDARY_EFFECT) !== 0 && effect.b?.is_pending()) {
				target = {
					parent: target,
					effect,
					effects: [],
					render_effects: [],
					block_effects: []
				};
			}

			if (!skip && effect.fn !== null) {
				if (is_branch) {
					effect.f ^= CLEAN;
				} else if ((flags & EFFECT) !== 0) {
					target.effects.push(effect);
				} else if (async_mode_flag && (flags & RENDER_EFFECT) !== 0) {
					target.render_effects.push(effect);
				} else if (is_dirty(effect)) {
					if ((effect.f & BLOCK_EFFECT) !== 0) target.block_effects.push(effect);
					update_effect(effect);
				}

				var child = effect.first;

				if (child !== null) {
					effect = child;
					continue;
				}
			}

			var parent = effect.parent;
			effect = effect.next;

			while (effect === null && parent !== null) {
				if (parent === target.effect) {
					// TODO rather than traversing into pending boundaries and deferring the effects,
					// could we just attach the effects _to_ the pending boundary and schedule them
					// once the boundary is ready?
					this.#defer_effects(target.effects);
					this.#defer_effects(target.render_effects);
					this.#defer_effects(target.block_effects);

					target = /** @type {EffectTarget} */ (target.parent);
				}

				effect = parent.next;
				parent = parent.parent;
			}
		}
	}

	/**
	 * @param {Effect[]} effects
	 */
	#defer_effects(effects) {
		for (const e of effects) {
			const target = (e.f & DIRTY) !== 0 ? this.#dirty_effects : this.#maybe_dirty_effects;
			target.push(e);

			// mark as clean so they get scheduled if they depend on pending async state
			set_signal_status(e, CLEAN);
		}
	}

	/**
	 * Associate a change to a given source with the current
	 * batch, noting its previous and current values
	 * @param {Source} source
	 * @param {any} value
	 */
	capture(source, value) {
		if (!this.previous.has(source)) {
			this.previous.set(source, value);
		}

		// Don't save errors in `batch_values`, or they won't be thrown in `runtime.js#get`
		if ((source.f & ERROR_VALUE) === 0) {
			this.current.set(source, source.v);
			batch_values?.set(source, source.v);
		}
	}

	activate() {
		current_batch = this;
		this.apply();
	}

	deactivate() {
		// If we're not the current batch, don't deactivate,
		// else we could create zombie batches that are never flushed
		if (current_batch !== this) return;

		current_batch = null;
		batch_values = null;
	}

	flush() {
		this.activate();

		if (queued_root_effects.length > 0) {
			flush_effects();

			if (current_batch !== null && current_batch !== this) {
				// this can happen if a new batch was created during `flush_effects()`
				return;
			}
		} else if (this.#pending === 0) {
			this.process([]); // TODO this feels awkward
		}

		this.deactivate();
	}

	discard() {
		for (const fn of this.#discard_callbacks) fn(this);
		this.#discard_callbacks.clear();
	}

	#resolve() {
		if (this.#blocking_pending === 0) {
			// append/remove branches
			for (const fn of this.#commit_callbacks) fn();
			this.#commit_callbacks.clear();
		}

		if (this.#pending === 0) {
			this.#commit();
		}
	}

	#commit() {
		// If there are other pending batches, they now need to be 'rebased' —
		// in other words, we re-run block/async effects with the newly
		// committed state, unless the batch in question has a more
		// recent value for a given source
		if (batches.size > 1) {
			this.previous.clear();

			var previous_batch_values = batch_values;
			var is_earlier = true;

			/** @type {EffectTarget} */
			var dummy_target = {
				parent: null,
				effect: null,
				effects: [],
				render_effects: [],
				block_effects: []
			};

			for (const batch of batches) {
				if (batch === this) {
					is_earlier = false;
					continue;
				}

				/** @type {Source[]} */
				const sources = [];

				for (const [source, value] of this.current) {
					if (batch.current.has(source)) {
						if (is_earlier && value !== batch.current.get(source)) {
							// bring the value up to date
							batch.current.set(source, value);
						} else {
							// same value or later batch has more recent value,
							// no need to re-run these effects
							continue;
						}
					}

					sources.push(source);
				}

				if (sources.length === 0) {
					continue;
				}

				// Re-run async/block effects that depend on distinct values changed in both batches
				const others = [...batch.current.keys()].filter((s) => !this.current.has(s));
				if (others.length > 0) {
					/** @type {Set<Value>} */
					const marked = new Set();
					/** @type {Map<Reaction, boolean>} */
					const checked = new Map();
					for (const source of sources) {
						mark_effects(source, others, marked, checked);
					}

					if (queued_root_effects.length > 0) {
						current_batch = batch;
						batch.apply();

						for (const root of queued_root_effects) {
							batch.#traverse_effect_tree(root, dummy_target);
						}

						// TODO do we need to do anything with `target`? defer block effects?

						queued_root_effects = [];
						batch.deactivate();
					}
				}
			}

			current_batch = null;
			batch_values = previous_batch_values;
		}

		this.committed = true;
		batches.delete(this);
	}

	/**
	 *
	 * @param {boolean} blocking
	 */
	increment(blocking) {
		this.#pending += 1;
		if (blocking) this.#blocking_pending += 1;
	}

	/**
	 *
	 * @param {boolean} blocking
	 */
	decrement(blocking) {
		this.#pending -= 1;
		if (blocking) this.#blocking_pending -= 1;

		this.revive();
	}

	revive() {
		for (const e of this.#dirty_effects) {
			set_signal_status(e, DIRTY);
			schedule_effect(e);
		}

		for (const e of this.#maybe_dirty_effects) {
			set_signal_status(e, MAYBE_DIRTY);
			schedule_effect(e);
		}

		this.#dirty_effects = [];
		this.#maybe_dirty_effects = [];

		this.flush();
	}

	/** @param {() => void} fn */
	oncommit(fn) {
		this.#commit_callbacks.add(fn);
	}

	/** @param {(batch: Batch) => void} fn */
	ondiscard(fn) {
		this.#discard_callbacks.add(fn);
	}

	settled() {
		return (this.#deferred ??= deferred()).promise;
	}

	static ensure() {
		if (current_batch === null) {
			const batch = (current_batch = new Batch());
			batches.add(current_batch);

			if (!is_flushing_sync) {
				Batch.enqueue(() => {
					if (current_batch !== batch) {
						// a flushSync happened in the meantime
						return;
					}

					batch.flush();
				});
			}
		}

		return current_batch;
	}

	/** @param {() => void} task */
	static enqueue(task) {
		queue_micro_task(task);
	}

	apply() {
		if (!async_mode_flag || (!this.is_fork && batches.size === 1)) return;

		// if there are multiple batches, we are 'time travelling' —
		// we need to override values with the ones in this batch...
		batch_values = new Map(this.current);

		// ...and undo changes belonging to other batches
		for (const batch of batches) {
			if (batch === this) continue;

			for (const [source, previous] of batch.previous) {
				if (!batch_values.has(source)) {
					batch_values.set(source, previous);
				}
			}
		}
	}
}

/**
 * Synchronously flush any pending updates.
 * Returns void if no callback is provided, otherwise returns the result of calling the callback.
 * @template [T=void]
 * @param {(() => T) | undefined} [fn]
 * @returns {T}
 */
function flushSync(fn) {
	if (async_mode_flag && active_effect !== null) {
		// We disallow this because it creates super-hard to reason about stack trace and because it's generally a bad idea
		flush_sync_in_effect();
	}

	var was_flushing_sync = is_flushing_sync;
	is_flushing_sync = true;

	try {
		var result;

		if (fn) {
			if (current_batch !== null) {
				flush_effects();
			}

			result = fn();
		}

		while (true) {
			flush_tasks();

			if (queued_root_effects.length === 0) {
				current_batch?.flush();

				// we need to check again, in case we just updated an `$effect.pending()`
				if (queued_root_effects.length === 0) {
					// this would be reset in `flush_effects()` but since we are early returning here,
					// we need to reset it here as well in case the first time there's 0 queued root effects
					last_scheduled_effect = null;

					return /** @type {T} */ (result);
				}
			}

			flush_effects();
		}
	} finally {
		is_flushing_sync = was_flushing_sync;
	}
}

function flush_effects() {
	var was_updating_effect = is_updating_effect;
	is_flushing = true;

	try {
		var flush_count = 0;
		set_is_updating_effect(true);

		while (queued_root_effects.length > 0) {
			var batch = Batch.ensure();

			if (flush_count++ > 1000) {
				var updates, entry; if (DEV) ;

				infinite_loop_guard();
			}

			batch.process(queued_root_effects);
			old_values.clear();
		}
	} finally {
		is_flushing = false;
		set_is_updating_effect(was_updating_effect);

		last_scheduled_effect = null;
	}
}

function infinite_loop_guard() {
	try {
		effect_update_depth_exceeded();
	} catch (error) {

		// Best effort: invoke the boundary nearest the most recent
		// effect and hope that it's relevant to the infinite loop
		invoke_error_boundary(error, last_scheduled_effect);
	}
}

/** @type {Set<Effect> | null} */
let eager_block_effects = null;

/**
 * @param {Array<Effect>} effects
 * @returns {void}
 */
function flush_queued_effects(effects) {
	var length = effects.length;
	if (length === 0) return;

	var i = 0;

	while (i < length) {
		var effect = effects[i++];

		if ((effect.f & (DESTROYED | INERT)) === 0 && is_dirty(effect)) {
			eager_block_effects = new Set();

			update_effect(effect);

			// Effects with no dependencies or teardown do not get added to the effect tree.
			// Deferred effects (e.g. `$effect(...)`) _are_ added to the tree because we
			// don't know if we need to keep them until they are executed. Doing the check
			// here (rather than in `update_effect`) allows us to skip the work for
			// immediate effects.
			if (effect.deps === null && effect.first === null && effect.nodes_start === null) {
				// if there's no teardown or abort controller we completely unlink
				// the effect from the graph
				if (effect.teardown === null && effect.ac === null) {
					// remove this effect from the graph
					unlink_effect(effect);
				} else {
					// keep the effect in the graph, but free up some memory
					effect.fn = null;
				}
			}

			// If update_effect() has a flushSync() in it, we may have flushed another flush_queued_effects(),
			// which already handled this logic and did set eager_block_effects to null.
			if (eager_block_effects?.size > 0) {
				old_values.clear();

				for (const e of eager_block_effects) {
					// Skip eager effects that have already been unmounted
					if ((e.f & (DESTROYED | INERT)) !== 0) continue;

					// Run effects in order from ancestor to descendant, else we could run into nullpointers
					/** @type {Effect[]} */
					const ordered_effects = [e];
					let ancestor = e.parent;
					while (ancestor !== null) {
						if (eager_block_effects.has(ancestor)) {
							eager_block_effects.delete(ancestor);
							ordered_effects.push(ancestor);
						}
						ancestor = ancestor.parent;
					}

					for (let j = ordered_effects.length - 1; j >= 0; j--) {
						const e = ordered_effects[j];
						// Skip eager effects that have already been unmounted
						if ((e.f & (DESTROYED | INERT)) !== 0) continue;
						update_effect(e);
					}
				}

				eager_block_effects.clear();
			}
		}
	}

	eager_block_effects = null;
}

/**
 * This is similar to `mark_reactions`, but it only marks async/block effects
 * depending on `value` and at least one of the other `sources`, so that
 * these effects can re-run after another batch has been committed
 * @param {Value} value
 * @param {Source[]} sources
 * @param {Set<Value>} marked
 * @param {Map<Reaction, boolean>} checked
 */
function mark_effects(value, sources, marked, checked) {
	if (marked.has(value)) return;
	marked.add(value);

	if (value.reactions !== null) {
		for (const reaction of value.reactions) {
			const flags = reaction.f;

			if ((flags & DERIVED) !== 0) {
				mark_effects(/** @type {Derived} */ (reaction), sources, marked, checked);
			} else if (
				(flags & (ASYNC | BLOCK_EFFECT)) !== 0 &&
				(flags & DIRTY) === 0 && // we may have scheduled this one already
				depends_on(reaction, sources, checked)
			) {
				set_signal_status(reaction, DIRTY);
				schedule_effect(/** @type {Effect} */ (reaction));
			}
		}
	}
}

/**
 * When committing a fork, we need to trigger eager effects so that
 * any `$state.eager(...)` expressions update immediately. This
 * function allows us to discover them
 * @param {Value} value
 * @param {Set<Effect>} effects
 */
function mark_eager_effects(value, effects) {
	if (value.reactions === null) return;

	for (const reaction of value.reactions) {
		const flags = reaction.f;

		if ((flags & DERIVED) !== 0) {
			mark_eager_effects(/** @type {Derived} */ (reaction), effects);
		} else if ((flags & EAGER_EFFECT) !== 0) {
			set_signal_status(reaction, DIRTY);
			effects.add(/** @type {Effect} */ (reaction));
		}
	}
}

/**
 * @param {Reaction} reaction
 * @param {Source[]} sources
 * @param {Map<Reaction, boolean>} checked
 */
function depends_on(reaction, sources, checked) {
	const depends = checked.get(reaction);
	if (depends !== undefined) return depends;

	if (reaction.deps !== null) {
		for (const dep of reaction.deps) {
			if (sources.includes(dep)) {
				return true;
			}

			if ((dep.f & DERIVED) !== 0 && depends_on(/** @type {Derived} */ (dep), sources, checked)) {
				checked.set(/** @type {Derived} */ (dep), true);
				return true;
			}
		}
	}

	checked.set(reaction, false);

	return false;
}

/**
 * @param {Effect} signal
 * @returns {void}
 */
function schedule_effect(signal) {
	var effect = (last_scheduled_effect = signal);

	while (effect.parent !== null) {
		effect = effect.parent;
		var flags = effect.f;

		// if the effect is being scheduled because a parent (each/await/etc) block
		// updated an internal source, bail out or we'll cause a second flush
		if (
			is_flushing &&
			effect === active_effect &&
			(flags & BLOCK_EFFECT) !== 0 &&
			(flags & HEAD_EFFECT) === 0
		) {
			return;
		}

		if ((flags & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
			if ((flags & CLEAN) === 0) return;
			effect.f ^= CLEAN;
		}
	}

	queued_root_effects.push(effect);
}

/** @type {Source<number>[]} */
let eager_versions = [];

function eager_flush() {
	try {
		flushSync(() => {
			for (const version of eager_versions) {
				update(version);
			}
		});
	} finally {
		eager_versions = [];
	}
}

/**
 * Implementation of `$state.eager(fn())`
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function eager(fn) {
	var version = source(0);
	var initial = true;
	var value = /** @type {T} */ (undefined);

	get(version);

	eager_effect(() => {
		if (initial) {
			// the first time this runs, we create an eager effect
			// that will run eagerly whenever the expression changes
			var previous_batch_values = batch_values;

			try {
				batch_values = null;
				value = fn();
			} finally {
				batch_values = previous_batch_values;
			}

			return;
		}

		// the second time this effect runs, it's to schedule a
		// `version` update. since this will recreate the effect,
		// we don't need to evaluate the expression here
		if (eager_versions.length === 0) {
			queue_micro_task(eager_flush);
		}

		eager_versions.push(version);
	});

	initial = false;

	return value;
}

/**
 * Creates a 'fork', in which state changes are evaluated but not applied to the DOM.
 * This is useful for speculatively loading data (for example) when you suspect that
 * the user is about to take some action.
 *
 * Frameworks like SvelteKit can use this to preload data when the user touches or
 * hovers over a link, making any subsequent navigation feel instantaneous.
 *
 * The `fn` parameter is a synchronous function that modifies some state. The
 * state changes will be reverted after the fork is initialised, then reapplied
 * if and when the fork is eventually committed.
 *
 * When it becomes clear that a fork will _not_ be committed (e.g. because the
 * user navigated elsewhere), it must be discarded to avoid leaking memory.
 *
 * @param {() => void} fn
 * @returns {Fork}
 * @since 5.42
 */
function fork(fn) {
	if (!async_mode_flag) {
		experimental_async_fork();
	}

	if (current_batch !== null) {
		fork_timing();
	}

	var batch = Batch.ensure();
	batch.is_fork = true;

	var committed = false;
	var settled = batch.settled();

	flushSync(fn);

	// revert state changes
	for (var [source, value] of batch.previous) {
		source.v = value;
	}

	return {
		commit: async () => {
			if (committed) {
				await settled;
				return;
			}

			if (!batches.has(batch)) {
				fork_discarded();
			}

			committed = true;

			batch.is_fork = false;

			// apply changes
			for (var [source, value] of batch.current) {
				source.v = value;
			}

			// trigger any `$state.eager(...)` expressions with the new state.
			// eager effects don't get scheduled like other effects, so we
			// can't just encounter them during traversal, we need to
			// proactively flush them
			// TODO maybe there's a better implementation?
			flushSync(() => {
				/** @type {Set<Effect>} */
				var eager_effects = new Set();

				for (var source of batch.current.keys()) {
					mark_eager_effects(source, eager_effects);
				}

				set_eager_effects(eager_effects);
				flush_eager_effects();
			});

			batch.revive();
			await settled;
		},
		discard: () => {
			if (!committed && batches.has(batch)) {
				batches.delete(batch);
				batch.discard();
			}
		}
	};
}

/**
 * Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
 * It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
 *
 * If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
 * the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
 *
 * If `start` returns a cleanup function, it will be called when the effect is destroyed.
 *
 * If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
 * are active, and the returned teardown function will only be called when all effects are destroyed.
 *
 * It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
 *
 * ```js
 * import { createSubscriber } from 'svelte/reactivity';
 * import { on } from 'svelte/events';
 *
 * export class MediaQuery {
 * 	#query;
 * 	#subscribe;
 *
 * 	constructor(query) {
 * 		this.#query = window.matchMedia(`(${query})`);
 *
 * 		this.#subscribe = createSubscriber((update) => {
 * 			// when the `change` event occurs, re-run any effects that read `this.current`
 * 			const off = on(this.#query, 'change', update);
 *
 * 			// stop listening when all the effects are destroyed
 * 			return () => off();
 * 		});
 * 	}
 *
 * 	get current() {
 * 		// This makes the getter reactive, if read in an effect
 * 		this.#subscribe();
 *
 * 		// Return the current state of the query, whether or not we're in an effect
 * 		return this.#query.matches;
 * 	}
 * }
 * ```
 * @param {(update: () => void) => (() => void) | void} start
 * @since 5.7.0
 */
function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;

	return () => {
		if (effect_tracking()) {
			get(version);

			render_effect(() => {
				if (subscribers === 0) {
					stop = untrack(() => start(() => increment(version)));
				}

				subscribers += 1;

				return () => {
					queue_micro_task(() => {
						// Only count down after a microtask, else we would reach 0 before our own render effect reruns,
						// but reach 1 again when the tick callback of the prior teardown runs. That would mean we
						// re-subcribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
						subscribers -= 1;

						if (subscribers === 0) {
							stop?.();
							stop = undefined;
							// Increment the version to ensure any dependent deriveds are marked dirty when the subscription is picked up again later.
							// If we didn't do this then the comparison of write versions would determine that the derived has a later version than
							// the subscriber, and it would not be re-run.
							increment(version);
						}
					});
				};
			});
		}
	};
}

/** @import { Effect, Source, TemplateNode, } from '#client' */

/**
 * @typedef {{
 * 	 onerror?: (error: unknown, reset: () => void) => void;
 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
 *   pending?: (anchor: Node) => void;
 * }} BoundaryProps
 */

var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;

/**
 * @param {TemplateNode} node
 * @param {BoundaryProps} props
 * @param {((anchor: Node) => void)} children
 * @returns {void}
 */
function boundary(node, props, children) {
	new Boundary(node, props, children);
}

class Boundary {
	/** @type {Boundary | null} */
	parent;

	#pending = false;

	/** @type {TemplateNode} */
	#anchor;

	/** @type {TemplateNode | null} */
	#hydrate_open = hydrating ? hydrate_node : null;

	/** @type {BoundaryProps} */
	#props;

	/** @type {((anchor: Node) => void)} */
	#children;

	/** @type {Effect} */
	#effect;

	/** @type {Effect | null} */
	#main_effect = null;

	/** @type {Effect | null} */
	#pending_effect = null;

	/** @type {Effect | null} */
	#failed_effect = null;

	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;

	/** @type {TemplateNode | null} */
	#pending_anchor = null;

	#local_pending_count = 0;
	#pending_count = 0;

	#is_creating_fallback = false;

	/**
	 * A source containing the number of pending async deriveds/expressions.
	 * Only created if `$effect.pending()` is used inside the boundary,
	 * otherwise updating the source results in needless `Batch.ensure()`
	 * calls followed by no-op flushes
	 * @type {Source<number> | null}
	 */
	#effect_pending = null;

	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);

		return () => {
			this.#effect_pending = null;
		};
	});

	/**
	 * @param {TemplateNode} node
	 * @param {BoundaryProps} props
	 * @param {((anchor: Node) => void)} children
	 */
	constructor(node, props, children) {
		this.#anchor = node;
		this.#props = props;
		this.#children = children;

		this.parent = /** @type {Effect} */ (active_effect).b;

		this.#pending = !!this.#props.pending;

		this.#effect = block(() => {
			/** @type {Effect} */ (active_effect).b = this;

			if (hydrating) {
				const comment = this.#hydrate_open;
				hydrate_next();

				const server_rendered_pending =
					/** @type {Comment} */ (comment).nodeType === COMMENT_NODE &&
					/** @type {Comment} */ (comment).data === HYDRATION_START_ELSE;

				if (server_rendered_pending) {
					this.#hydrate_pending_content();
				} else {
					this.#hydrate_resolved_content();
				}
			} else {
				var anchor = this.#get_anchor();

				try {
					this.#main_effect = branch(() => children(anchor));
				} catch (error) {
					this.error(error);
				}

				if (this.#pending_count > 0) {
					this.#show_pending_snippet();
				} else {
					this.#pending = false;
				}
			}

			return () => {
				this.#pending_anchor?.remove();
			};
		}, flags);

		if (hydrating) {
			this.#anchor = hydrate_node;
		}
	}

	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}

		// Since server rendered resolved content, we never show pending state
		// Even if client-side async operations are still running, the content is already displayed
		this.#pending = false;
	}

	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) {
			return;
		}
		this.#pending_effect = branch(() => pending(this.#anchor));

		Batch.enqueue(() => {
			var anchor = this.#get_anchor();

			this.#main_effect = this.#run(() => {
				Batch.ensure();
				return branch(() => this.#children(anchor));
			});

			if (this.#pending_count > 0) {
				this.#show_pending_snippet();
			} else {
				pause_effect(/** @type {Effect} */ (this.#pending_effect), () => {
					this.#pending_effect = null;
				});

				this.#pending = false;
			}
		});
	}

	#get_anchor() {
		var anchor = this.#anchor;

		if (this.#pending) {
			this.#pending_anchor = create_text();
			this.#anchor.before(this.#pending_anchor);

			anchor = this.#pending_anchor;
		}

		return anchor;
	}

	/**
	 * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
	 * @returns {boolean}
	 */
	is_pending() {
		return this.#pending || (!!this.parent && this.parent.is_pending());
	}

	has_pending_snippet() {
		return !!this.#props.pending;
	}

	/**
	 * @param {() => Effect | null} fn
	 */
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;

		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);

		try {
			return fn();
		} catch (e) {
			handle_error(e);
			return null;
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}

	#show_pending_snippet() {
		const pending = /** @type {(anchor: Node) => void} */ (this.#props.pending);

		if (this.#main_effect !== null) {
			this.#offscreen_fragment = document.createDocumentFragment();
			this.#offscreen_fragment.append(/** @type {TemplateNode} */ (this.#pending_anchor));
			move_effect(this.#main_effect, this.#offscreen_fragment);
		}

		if (this.#pending_effect === null) {
			this.#pending_effect = branch(() => pending(this.#anchor));
		}
	}

	/**
	 * Updates the pending count associated with the currently visible pending snippet,
	 * if any, such that we can replace the snippet with content once work is done
	 * @param {1 | -1} d
	 */
	#update_pending_count(d) {
		if (!this.has_pending_snippet()) {
			if (this.parent) {
				this.parent.#update_pending_count(d);
			}

			// if there's no parent, we're in a scope with no pending snippet
			return;
		}

		this.#pending_count += d;

		if (this.#pending_count === 0) {
			this.#pending = false;

			if (this.#pending_effect) {
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
			}

			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}

	/**
	 * Update the source that powers `$effect.pending()` inside this boundary,
	 * and controls when the current `pending` snippet (if any) is removed.
	 * Do not call from inside the class
	 * @param {1 | -1} d
	 */
	update_pending_count(d) {
		this.#update_pending_count(d);

		this.#local_pending_count += d;

		if (this.#effect_pending) {
			internal_set(this.#effect_pending, this.#local_pending_count);
		}
	}

	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(/** @type {Source<number>} */ (this.#effect_pending));
	}

	/** @param {unknown} error */
	error(error) {
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;

		// If we have nothing to capture the error, or if we hit an error while
		// rendering the fallback, re-throw for another boundary to handle
		if (this.#is_creating_fallback || (!onerror && !failed)) {
			throw error;
		}

		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}

		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}

		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}

		if (hydrating) {
			set_hydrate_node(/** @type {TemplateNode} */ (this.#hydrate_open));
			next();
			set_hydrate_node(skip_nodes());
		}

		var did_reset = false;
		var calling_on_error = false;

		const reset = () => {
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}

			did_reset = true;

			if (calling_on_error) {
				svelte_boundary_reset_onerror();
			}

			// If the failure happened while flushing effects, current_batch can be null
			Batch.ensure();

			this.#local_pending_count = 0;

			if (this.#failed_effect !== null) {
				pause_effect(this.#failed_effect, () => {
					this.#failed_effect = null;
				});
			}

			// we intentionally do not try to find the nearest pending boundary. If this boundary has one, we'll render it on reset
			// but it would be really weird to show the parent's boundary on a child reset.
			this.#pending = this.has_pending_snippet();

			this.#main_effect = this.#run(() => {
				this.#is_creating_fallback = false;
				return branch(() => this.#children(this.#anchor));
			});

			if (this.#pending_count > 0) {
				this.#show_pending_snippet();
			} else {
				this.#pending = false;
			}
		};

		var previous_reaction = active_reaction;

		try {
			set_active_reaction(null);
			calling_on_error = true;
			onerror?.(error, reset);
			calling_on_error = false;
		} catch (error) {
			invoke_error_boundary(error, this.#effect && this.#effect.parent);
		} finally {
			set_active_reaction(previous_reaction);
		}

		if (failed) {
			queue_micro_task(() => {
				this.#failed_effect = this.#run(() => {
					Batch.ensure();
					this.#is_creating_fallback = true;

					try {
						return branch(() => {
							failed(
								this.#anchor,
								() => error,
								() => reset
							);
						});
					} catch (error) {
						invoke_error_boundary(error, /** @type {Effect} */ (this.#effect.parent));
						return null;
					} finally {
						this.#is_creating_fallback = false;
					}
				});
			});
		}
	}
}

function get_boundary() {
	return /** @type {Boundary} */ (/** @type {Effect} */ (active_effect).b);
}

function pending() {
	if (active_effect === null) {
		effect_pending_outside_reaction();
	}

	var boundary = active_effect.b;

	if (boundary === null) {
		return 0; // TODO eventually we will need this to be global
	}

	return boundary.get_effect_pending();
}

/** @import { Effect, TemplateNode, Value } from '#client' */

/**
 * @param {Array<Promise<void>>} blockers
 * @param {Array<() => any>} sync
 * @param {Array<() => Promise<any>>} async
 * @param {(values: Value[]) => any} fn
 */
function flatten(blockers, sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;

	if (async.length === 0 && blockers.length === 0) {
		fn(sync.map(d));
		return;
	}

	var batch = current_batch;
	var parent = /** @type {Effect} */ (active_effect);

	var restore = capture();

	function run() {
		Promise.all(async.map((expression) => async_derived(expression)))
			.then((result) => {
				restore();

				try {
					fn([...sync.map(d), ...result]);
				} catch (error) {
					// ignore errors in blocks that have already been destroyed
					if ((parent.f & DESTROYED) === 0) {
						invoke_error_boundary(error, parent);
					}
				}

				batch?.deactivate();
				unset_context();
			})
			.catch((error) => {
				invoke_error_boundary(error, parent);
			});
	}

	if (blockers.length > 0) {
		Promise.all(blockers).then(() => {
			restore();

			try {
				return run();
			} finally {
				batch?.deactivate();
				unset_context();
			}
		});
	} else {
		run();
	}
}

/**
 * @param {Array<Promise<void>>} blockers
 * @param {(values: Value[]) => any} fn
 */
function run_after_blockers(blockers, fn) {
	flatten(blockers, [], [], fn);
}

/**
 * Captures the current effect context so that we can restore it after
 * some asynchronous work has happened (so that e.g. `await a + b`
 * causes `b` to be registered as a dependency).
 */
function capture() {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch = current_batch;

	return function restore(activate_batch = true) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		if (activate_batch) previous_batch?.activate();
	};
}

/**
 * Wraps an `await` expression in such a way that the effect context that was
 * active before the expression evaluated can be reapplied afterwards —
 * `await a + b` becomes `(await $.save(a))() + b`
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
async function save(promise) {
	var restore = capture();
	var value = await promise;

	return () => {
		restore();
		return value;
	};
}

/**
 * Reset `current_async_effect` after the `promise` resolves, so
 * that we can emit `await_reactivity_loss` warnings
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
async function track_reactivity_loss(promise) {
	var value = await promise;

	return () => {
		return value;
	};
}

/**
 * Used in `for await` loops in DEV, so
 * that we can emit `await_reactivity_loss` warnings
 * after each `async_iterator` result resolves and
 * after the `async_iterator` return resolves (if it runs)
 * @template T
 * @template TReturn
 * @param {Iterable<T> | AsyncIterable<T>} iterable
 * @returns {AsyncGenerator<T, TReturn | undefined>}
 */
async function* for_await_track_reactivity_loss(iterable) {
	// This is based on the algorithms described in ECMA-262:
	// ForIn/OfBodyEvaluation
	// https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-runtime-semantics-forin-div-ofbodyevaluation-lhs-stmt-iterator-lhskind-labelset
	// AsyncIteratorClose
	// https://tc39.es/ecma262/multipage/abstract-operations.html#sec-asynciteratorclose

	/** @type {AsyncIterator<T, TReturn>} */
	// @ts-ignore
	const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();

	if (iterator === undefined) {
		throw new TypeError('value is not async iterable');
	}

	/** Whether the completion of the iterator was "normal", meaning it wasn't ended via `break` or a similar method */
	let normal_completion = false;
	try {
		while (true) {
			const { done, value } = (await track_reactivity_loss(iterator.next()))();
			if (done) {
				normal_completion = true;
				break;
			}
			yield value;
		}
	} finally {
		// If the iterator had a normal completion and `return` is defined on the iterator, call it and return the value
		if (normal_completion && iterator.return !== undefined) {
			// eslint-disable-next-line no-unsafe-finally
			return /** @type {TReturn} */ ((await track_reactivity_loss(iterator.return()))().value);
		}
	}
}

function unset_context() {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
}

/**
 * @param {TemplateNode} anchor
 * @param {(target: TemplateNode) => Promise<void>} fn
 */
async function async_body(anchor, fn) {
	var boundary = get_boundary();
	var batch = /** @type {Batch} */ (current_batch);
	var blocking = !boundary.is_pending();

	boundary.update_pending_count(1);
	batch.increment(blocking);

	var active = /** @type {Effect} */ (active_effect);

	var was_hydrating = hydrating;
	var next_hydrate_node = undefined;

	if (was_hydrating) {
		hydrate_next();
		next_hydrate_node = skip_nodes(false);
	}

	try {
		var promise = fn(anchor);
	} finally {
		if (next_hydrate_node) {
			set_hydrate_node(next_hydrate_node);
			hydrate_next();
		}
	}

	try {
		await promise;
	} catch (error) {
		if (!aborted(active)) {
			invoke_error_boundary(error, active);
		}
	} finally {
		boundary.update_pending_count(-1);
		batch.decrement(blocking);

		unset_context();
	}
}

/**
 * @param {Array<() => void | Promise<void>>} thunks
 */
function run(thunks) {
	const restore = capture();

	var boundary = get_boundary();
	var batch = /** @type {Batch} */ (current_batch);
	var blocking = !boundary.is_pending();

	boundary.update_pending_count(1);
	batch.increment(blocking);

	var active = /** @type {Effect} */ (active_effect);

	/** @type {null | { error: any }} */
	var errored = null;

	/** @param {any} error */
	const handle_error = (error) => {
		errored = { error }; // wrap in object in case a promise rejects with a falsy value

		if (!aborted(active)) {
			invoke_error_boundary(error, active);
		}
	};

	var promise = Promise.resolve(thunks[0]()).catch(handle_error);

	var promises = [promise];

	for (const fn of thunks.slice(1)) {
		promise = promise
			.then(() => {
				if (errored) {
					throw errored.error;
				}

				if (aborted(active)) {
					throw STALE_REACTION;
				}

				try {
					restore();
					return fn();
				} finally {
					// TODO do we need it here as well as below?
					unset_context();
				}
			})
			.catch(handle_error)
			.finally(() => {
				unset_context();
			});

		promises.push(promise);
	}

	promise
		// wait one more tick, so that template effects are
		// guaranteed to run before `$effect(...)`
		.then(() => Promise.resolve())
		.finally(() => {
			boundary.update_pending_count(-1);
			batch.decrement(blocking);
		});

	return promises;
}

/** @import { Derived, Effect, Source } from '#client' */
/** @import { Batch } from './batch.js'; */

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
function derived(fn) {
	var flags = DERIVED | DIRTY;
	var parent_derived =
		active_reaction !== null && (active_reaction.f & DERIVED) !== 0
			? /** @type {Derived} */ (active_reaction)
			: null;

	if (active_effect !== null) {
		// Since deriveds are evaluated lazily, any effects created inside them are
		// created too late to ensure that the parent effect is added to the tree
		active_effect.f |= EFFECT_PRESERVED;
	}

	/** @type {Derived<V>} */
	const signal = {
		ctx: component_context,
		deps: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v: /** @type {V} */ (UNINITIALIZED),
		wv: 0,
		parent: parent_derived ?? active_effect,
		ac: null
	};

	return signal;
}

/**
 * @template V
 * @param {() => V | Promise<V>} fn
 * @param {string} [location] If provided, print a warning if the value is not read immediately after update
 * @returns {Promise<Source<V>>}
 */
/*#__NO_SIDE_EFFECTS__*/
function async_derived(fn, location) {
	let parent = /** @type {Effect | null} */ (active_effect);

	if (parent === null) {
		async_derived_orphan();
	}

	var boundary = /** @type {Boundary} */ (parent.b);

	var promise = /** @type {Promise<V>} */ (/** @type {unknown} */ (undefined));
	var signal = source(/** @type {V} */ (UNINITIALIZED));

	// only suspend in async deriveds created on initialisation
	var should_suspend = !active_reaction;

	/** @type {Map<Batch, ReturnType<typeof deferred<V>>>} */
	var deferreds = new Map();

	async_effect(() => {

		/** @type {ReturnType<typeof deferred<V>>} */
		var d = deferred();
		promise = d.promise;

		try {
			// If this code is changed at some point, make sure to still access the then property
			// of fn() to read any signals it might access, so that we track them as dependencies.
			// We call `unset_context` to undo any `save` calls that happen inside `fn()`
			Promise.resolve(fn())
				.then(d.resolve, d.reject)
				.then(() => {
					if (batch === current_batch && batch.committed) {
						// if the batch was rejected as stale, we need to cleanup
						// after any `$.save(...)` calls inside `fn()`
						batch.deactivate();
					}

					unset_context();
				});
		} catch (error) {
			d.reject(error);
			unset_context();
		}

		var batch = /** @type {Batch} */ (current_batch);

		if (should_suspend) {
			var blocking = !boundary.is_pending();

			boundary.update_pending_count(1);
			batch.increment(blocking);

			deferreds.get(batch)?.reject(STALE_REACTION);
			deferreds.delete(batch); // delete to ensure correct order in Map iteration below
			deferreds.set(batch, d);
		}

		/**
		 * @param {any} value
		 * @param {unknown} error
		 */
		const handler = (value, error = undefined) => {

			batch.activate();

			if (error) {
				if (error !== STALE_REACTION) {
					signal.f |= ERROR_VALUE;

					// @ts-expect-error the error is the wrong type, but we don't care
					internal_set(signal, error);
				}
			} else {
				if ((signal.f & ERROR_VALUE) !== 0) {
					signal.f ^= ERROR_VALUE;
				}

				internal_set(signal, value);

				// All prior async derived runs are now stale
				for (const [b, d] of deferreds) {
					deferreds.delete(b);
					if (b === batch) break;
					d.reject(STALE_REACTION);
				}
			}

			if (should_suspend) {
				boundary.update_pending_count(-1);
				batch.decrement(blocking);
			}
		};

		d.promise.then(handler, (e) => handler(null, e || 'unknown'));
	});

	teardown(() => {
		for (const d of deferreds.values()) {
			d.reject(STALE_REACTION);
		}
	});

	return new Promise((fulfil) => {
		/** @param {Promise<V>} p */
		function next(p) {
			function go() {
				if (p === promise) {
					fulfil(signal);
				} else {
					// if the effect re-runs before the initial promise
					// resolves, delay resolution until we have a value
					next(promise);
				}
			}

			p.then(go, go);
		}

		next(promise);
	});
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
function user_derived(fn) {
	const d = derived(fn);

	if (!async_mode_flag) push_reaction_value(d);

	return d;
}

/**
 * @template V
 * @param {() => V} fn
 * @returns {Derived<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.equals = safe_equals;
	return signal;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
function destroy_derived_effects(derived) {
	var effects = derived.effects;

	if (effects !== null) {
		derived.effects = null;

		for (var i = 0; i < effects.length; i += 1) {
			destroy_effect(/** @type {Effect} */ (effects[i]));
		}
	}
}

/**
 * @param {Derived} derived
 * @returns {Effect | null}
 */
function get_derived_parent_effect(derived) {
	var parent = derived.parent;
	while (parent !== null) {
		if ((parent.f & DERIVED) === 0) {
			return /** @type {Effect} */ (parent);
		}
		parent = parent.parent;
	}
	return null;
}

/**
 * @template T
 * @param {Derived} derived
 * @returns {T}
 */
function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;

	set_active_effect(get_derived_parent_effect(derived));

	{
		try {
			derived.f &= ~WAS_MARKED;
			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
		}
	}

	return value;
}

/**
 * @param {Derived} derived
 * @returns {void}
 */
function update_derived(derived) {
	var value = execute_derived(derived);

	if (!derived.equals(value)) {
		// TODO can we avoid setting `derived.v` when `batch_values !== null`,
		// without causing the value to be stale later?
		derived.v = value;
		derived.wv = increment_write_version();
	}

	// don't mark derived clean if we're reading it inside a
	// cleanup function, or it will cache a stale value
	if (is_destroying_effect) {
		return;
	}

	// During time traveling we don't want to reset the status so that
	// traversal of the graph in the other batches still happens
	if (batch_values !== null) {
		// only cache the value if we're in a tracking context, otherwise we won't
		// clear the cache in `mark_reactions` when dependencies are updated
		if (effect_tracking()) {
			batch_values.set(derived, derived.v);
		}
	} else {
		var status = (derived.f & CONNECTED) === 0 ? MAYBE_DIRTY : CLEAN;
		set_signal_status(derived, status);
	}
}

/** @import { Derived, Effect, Source, Value } from '#client' */

/** @type {Set<any>} */
let eager_effects = new Set();

/** @type {Map<Source, any>} */
const old_values = new Map();

/**
 * @param {Set<any>} v
 */
function set_eager_effects(v) {
	eager_effects = v;
}

let eager_effects_deferred = false;

/**
 * @template V
 * @param {V} v
 * @param {Error | null} [stack]
 * @returns {Source<V>}
 */
// TODO rename this to `state` throughout the codebase
function source(v, stack) {
	/** @type {Value} */
	var signal = {
		f: 0, // TODO ideally we could skip this altogether, but it causes type errors
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};

	return signal;
}

/**
 * @template V
 * @param {V} v
 * @param {Error | null} [stack]
 */
/*#__NO_SIDE_EFFECTS__*/
function state(v, stack) {
	const s = source(v);

	push_reaction_value(s);

	return s;
}

/**
 * @template V
 * @param {V} initial_value
 * @param {boolean} [immutable]
 * @returns {Source<V>}
 */
/*#__NO_SIDE_EFFECTS__*/
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) {
		s.equals = safe_equals;
	}

	// bind the signal to the component context, in case we need to
	// track updates to trigger beforeUpdate/afterUpdate callbacks
	if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
		(component_context.l.s ??= []).push(s);
	}

	return s;
}

/**
 * @template V
 * @param {Value<V>} source
 * @param {V} value
 */
function mutate(source, value) {
	set(
		source,
		untrack(() => get(source))
	);
	return value;
}

/**
 * @template V
 * @param {Source<V>} source
 * @param {V} value
 * @param {boolean} [should_proxy]
 * @returns {V}
 */
function set(source, value, should_proxy = false) {
	if (
		active_reaction !== null &&
		// since we are untracking the function inside `$inspect.with` we need to add this check
		// to ensure we error if state is set inside an inspect effect
		(!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) &&
		is_runes() &&
		(active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 &&
		!current_sources?.includes(source)
	) {
		state_unsafe_mutation();
	}

	let new_value = should_proxy ? proxy(value) : value;

	return internal_set(source, new_value);
}

/**
 * @template V
 * @param {Source<V>} source
 * @param {V} value
 * @returns {V}
 */
function internal_set(source, value) {
	if (!source.equals(value)) {
		var old_value = source.v;

		if (is_destroying_effect) {
			old_values.set(source, value);
		} else {
			old_values.set(source, old_value);
		}

		source.v = value;

		var batch = Batch.ensure();
		batch.capture(source, old_value);

		if ((source.f & DERIVED) !== 0) {
			// if we are assigning to a dirty derived we set it to clean/maybe dirty but we also eagerly execute it to track the dependencies
			if ((source.f & DIRTY) !== 0) {
				execute_derived(/** @type {Derived} */ (source));
			}

			set_signal_status(source, (source.f & CONNECTED) !== 0 ? CLEAN : MAYBE_DIRTY);
		}

		source.wv = increment_write_version();

		mark_reactions(source, DIRTY);

		// It's possible that the current reaction might not have up-to-date dependencies
		// whilst it's actively running. So in the case of ensuring it registers the reaction
		// properly for itself, we need to ensure the current effect actually gets
		// scheduled. i.e: `$effect(() => x++)`
		if (
			is_runes() &&
			active_effect !== null &&
			(active_effect.f & CLEAN) !== 0 &&
			(active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0
		) {
			if (untracked_writes === null) {
				set_untracked_writes([source]);
			} else {
				untracked_writes.push(source);
			}
		}

		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
			flush_eager_effects();
		}
	}

	return value;
}

function flush_eager_effects() {
	eager_effects_deferred = false;

	const inspects = Array.from(eager_effects);

	for (const effect of inspects) {
		// Mark clean inspect-effects as maybe dirty and then check their dirtiness
		// instead of just updating the effects - this way we avoid overfiring.
		if ((effect.f & CLEAN) !== 0) {
			set_signal_status(effect, MAYBE_DIRTY);
		}

		if (is_dirty(effect)) {
			update_effect(effect);
		}
	}

	eager_effects.clear();
}

/**
 * @template {number | bigint} T
 * @param {Source<T>} source
 * @param {1 | -1} [d]
 * @returns {T}
 */
function update(source, d = 1) {
	var value = get(source);
	var result = d === 1 ? value++ : value--;

	set(source, value);

	// @ts-expect-error
	return result;
}

/**
 * @template {number | bigint} T
 * @param {Source<T>} source
 * @param {1 | -1} [d]
 * @returns {T}
 */
function update_pre(source, d = 1) {
	var value = get(source);

	// @ts-expect-error
	return set(source, d === 1 ? ++value : --value);
}

/**
 * Silently (without using `get`) increment a source
 * @param {Source<number>} source
 */
function increment(source) {
	set(source, source.v + 1);
}

/**
 * @param {Value} signal
 * @param {number} status should be DIRTY or MAYBE_DIRTY
 * @returns {void}
 */
function mark_reactions(signal, status) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	var runes = is_runes();
	var length = reactions.length;

	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;

		// In legacy mode, skip the current effect to prevent infinite loops
		if (!runes && reaction === active_effect) continue;

		var not_dirty = (flags & DIRTY) === 0;

		// don't set a DIRTY reaction to MAYBE_DIRTY
		if (not_dirty) {
			set_signal_status(reaction, status);
		}

		if ((flags & DERIVED) !== 0) {
			var derived = /** @type {Derived} */ (reaction);

			batch_values?.delete(derived);

			if ((flags & WAS_MARKED) === 0) {
				// Only connected deriveds can be reliably unmarked right away
				if (flags & CONNECTED) {
					reaction.f |= WAS_MARKED;
				}

				mark_reactions(derived, MAYBE_DIRTY);
			}
		} else if (not_dirty) {
			if ((flags & BLOCK_EFFECT) !== 0) {
				if (eager_block_effects !== null) {
					eager_block_effects.add(/** @type {Effect} */ (reaction));
				}
			}

			schedule_effect(/** @type {Effect} */ (reaction));
		}
	}
}

/** @import { Source } from '#client' */

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
function proxy(value) {
	// if non-proxyable, or is already a proxy, return `value`
	if (typeof value !== 'object' || value === null || STATE_SYMBOL in value) {
		return value;
	}

	const prototype = get_prototype_of(value);

	if (prototype !== object_prototype && prototype !== array_prototype) {
		return value;
	}

	/** @type {Map<any, Source<any>>} */
	var sources = new Map();
	var is_proxied_array = is_array(value);
	var version = state(0);
	var parent_version = update_version;

	/**
	 * Executes the proxy in the context of the reaction it was originally created in, if any
	 * @template T
	 * @param {() => T} fn
	 */
	var with_parent = (fn) => {
		if (update_version === parent_version) {
			return fn();
		}

		// child source is being created after the initial proxy —
		// prevent it from being associated with the current reaction
		var reaction = active_reaction;
		var version = update_version;

		set_active_reaction(null);
		set_update_version(parent_version);

		var result = fn();

		set_active_reaction(reaction);
		set_update_version(version);

		return result;
	};

	if (is_proxied_array) {
		// We need to create the length source eagerly to ensure that
		// mutations to the array are properly synced with our proxy
		sources.set('length', state(/** @type {any[]} */ (value).length));
	}

	return new Proxy(/** @type {any} */ (value), {
		defineProperty(_, prop, descriptor) {
			if (
				!('value' in descriptor) ||
				descriptor.configurable === false ||
				descriptor.enumerable === false ||
				descriptor.writable === false
			) {
				// we disallow non-basic descriptors, because unless they are applied to the
				// target object — which we avoid, so that state can be forked — we will run
				// afoul of the various invariants
				// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy/getOwnPropertyDescriptor#invariants
				state_descriptors_fixed();
			}
			var s = sources.get(prop);
			if (s === undefined) {
				s = with_parent(() => {
					var s = state(descriptor.value);
					sources.set(prop, s);
					return s;
				});
			} else {
				set(s, descriptor.value, true);
			}

			return true;
		},

		deleteProperty(target, prop) {
			var s = sources.get(prop);

			if (s === undefined) {
				if (prop in target) {
					const s = with_parent(() => state(UNINITIALIZED));
					sources.set(prop, s);
					increment(version);
				}
			} else {
				set(s, UNINITIALIZED);
				increment(version);
			}

			return true;
		},

		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) {
				return value;
			}

			var s = sources.get(prop);
			var exists = prop in target;

			// create a source, but only if it's an own property and not a prototype property
			if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					var p = proxy(exists ? target[prop] : UNINITIALIZED);
					var s = state(p);

					return s;
				});

				sources.set(prop, s);
			}

			if (s !== undefined) {
				var v = get(s);
				return v === UNINITIALIZED ? undefined : v;
			}

			return Reflect.get(target, prop, receiver);
		},

		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

			if (descriptor && 'value' in descriptor) {
				var s = sources.get(prop);
				if (s) descriptor.value = get(s);
			} else if (descriptor === undefined) {
				var source = sources.get(prop);
				var value = source?.v;

				if (source !== undefined && value !== UNINITIALIZED) {
					return {
						enumerable: true,
						configurable: true,
						value,
						writable: true
					};
				}
			}

			return descriptor;
		},

		has(target, prop) {
			if (prop === STATE_SYMBOL) {
				return true;
			}

			var s = sources.get(prop);
			var has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);

			if (
				s !== undefined ||
				(active_effect !== null && (!has || get_descriptor(target, prop)?.writable))
			) {
				if (s === undefined) {
					s = with_parent(() => {
						var p = has ? proxy(target[prop]) : UNINITIALIZED;
						var s = state(p);

						return s;
					});

					sources.set(prop, s);
				}

				var value = get(s);
				if (value === UNINITIALIZED) {
					return false;
				}
			}

			return has;
		},

		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;

			// variable.length = value -> clear all signals with index >= value
			if (is_proxied_array && prop === 'length') {
				for (var i = value; i < /** @type {Source<number>} */ (s).v; i += 1) {
					var other_s = sources.get(i + '');
					if (other_s !== undefined) {
						set(other_s, UNINITIALIZED);
					} else if (i in target) {
						// If the item exists in the original, we need to create an uninitialized source,
						// else a later read of the property would result in a source being created with
						// the value of the original item at that index.
						other_s = with_parent(() => state(UNINITIALIZED));
						sources.set(i + '', other_s);
					}
				}
			}

			// If we haven't yet created a source for this property, we need to ensure
			// we do so otherwise if we read it later, then the write won't be tracked and
			// the heuristics of effects will be different vs if we had read the proxied
			// object property before writing to that property.
			if (s === undefined) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => state(undefined));
					set(s, proxy(value));

					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;

				var p = with_parent(() => proxy(value));
				set(s, p);
			}

			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

			// Set the new value before updating any signals so that any listeners get the new value
			if (descriptor?.set) {
				descriptor.set.call(receiver, value);
			}

			if (!has) {
				// If we have mutated an array directly, we might need to
				// signal that length has also changed. Do it before updating metadata
				// to ensure that iterating over the array as a result of a metadata update
				// will not cause the length to be out of sync.
				if (is_proxied_array && typeof prop === 'string') {
					var ls = /** @type {Source<number>} */ (sources.get('length'));
					var n = Number(prop);

					if (Number.isInteger(n) && n >= ls.v) {
						set(ls, n + 1);
					}
				}

				increment(version);
			}

			return true;
		},

		ownKeys(target) {
			get(version);

			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === undefined || source.v !== UNINITIALIZED;
			});

			for (var [key, source] of sources) {
				if (source.v !== UNINITIALIZED && !(key in target)) {
					own_keys.push(key);
				}
			}

			return own_keys;
		},

		setPrototypeOf() {
			state_prototype_fixed();
		}
	});
}

/**
 * @param {any} value
 */
function get_proxied_value(value) {
	try {
		if (value !== null && typeof value === 'object' && STATE_SYMBOL in value) {
			return value[STATE_SYMBOL];
		}
	} catch {
		// the above if check can throw an error if the value in question
		// is the contentWindow of an iframe on another domain, in which
		// case we want to just return the value (because it's definitely
		// not a proxied value) so we don't break any JavaScript interacting
		// with that iframe (such as various payment companies client side
		// JavaScript libraries interacting with their iframes on the same
		// domain)
	}

	return value;
}

/**
 * @param {any} a
 * @param {any} b
 */
function is(a, b) {
	return Object.is(get_proxied_value(a), get_proxied_value(b));
}

/** @import { Effect, TemplateNode } from '#client' */

// export these for reference in the compiled code, making global name deduplication unnecessary
/** @type {Window} */
var $window;

/** @type {Document} */
var $document;

/** @type {boolean} */
var is_firefox;

/** @type {() => Node | null} */
var first_child_getter;
/** @type {() => Node | null} */
var next_sibling_getter;

/**
 * Initialize these lazily to avoid issues when using the runtime in a server context
 * where these globals are not available while avoiding a separate server entry point
 */
function init_operations() {
	if ($window !== undefined) {
		return;
	}

	$window = window;
	$document = document;
	is_firefox = /Firefox/.test(navigator.userAgent);

	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;

	// @ts-ignore
	first_child_getter = get_descriptor(node_prototype, 'firstChild').get;
	// @ts-ignore
	next_sibling_getter = get_descriptor(node_prototype, 'nextSibling').get;

	if (is_extensible(element_prototype)) {
		// the following assignments improve perf of lookups on DOM nodes
		// @ts-expect-error
		element_prototype.__click = undefined;
		// @ts-expect-error
		element_prototype.__className = undefined;
		// @ts-expect-error
		element_prototype.__attributes = null;
		// @ts-expect-error
		element_prototype.__style = undefined;
		// @ts-expect-error
		element_prototype.__e = undefined;
	}

	if (is_extensible(text_prototype)) {
		// @ts-expect-error
		text_prototype.__t = undefined;
	}
}

/**
 * @param {string} value
 * @returns {Text}
 */
function create_text(value = '') {
	return document.createTextNode(value);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {Node | null}
 */
/*@__NO_SIDE_EFFECTS__*/
function get_first_child(node) {
	return first_child_getter.call(node);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {Node | null}
 */
/*@__NO_SIDE_EFFECTS__*/
function get_next_sibling(node) {
	return next_sibling_getter.call(node);
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @template {Node} N
 * @param {N} node
 * @param {boolean} is_text
 * @returns {Node | null}
 */
function child(node, is_text) {
	if (!hydrating) {
		return get_first_child(node);
	}

	var child = /** @type {TemplateNode} */ (get_first_child(hydrate_node));

	// Child can be null if we have an element with a single child, like `<p>{text}</p>`, where `text` is empty
	if (child === null) {
		child = hydrate_node.appendChild(create_text());
	} else if (is_text && child.nodeType !== TEXT_NODE) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}

	set_hydrate_node(child);
	return child;
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {DocumentFragment | TemplateNode | TemplateNode[]} fragment
 * @param {boolean} [is_text]
 * @returns {Node | null}
 */
function first_child(fragment, is_text = false) {
	if (!hydrating) {
		// when not hydrating, `fragment` is a `DocumentFragment` (the result of calling `open_frag`)
		var first = /** @type {DocumentFragment} */ (get_first_child(/** @type {Node} */ (fragment)));

		// TODO prevent user comments with the empty string when preserveComments is true
		if (first instanceof Comment && first.data === '') return get_next_sibling(first);

		return first;
	}

	// if an {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && hydrate_node?.nodeType !== TEXT_NODE) {
		var text = create_text();

		hydrate_node?.before(text);
		set_hydrate_node(text);
		return text;
	}

	return hydrate_node;
}

/**
 * Don't mark this as side-effect-free, hydration needs to walk all nodes
 * @param {TemplateNode} node
 * @param {number} count
 * @param {boolean} is_text
 * @returns {Node | null}
 */
function sibling(node, count = 1, is_text = false) {
	let next_sibling = hydrating ? hydrate_node : node;
	var last_sibling;

	while (count--) {
		last_sibling = next_sibling;
		next_sibling = /** @type {TemplateNode} */ (get_next_sibling(next_sibling));
	}

	if (!hydrating) {
		return next_sibling;
	}

	// if a sibling {expression} is empty during SSR, there might be no
	// text node to hydrate — we must therefore create one
	if (is_text && next_sibling?.nodeType !== TEXT_NODE) {
		var text = create_text();
		// If the next sibling is `null` and we're handling text then it's because
		// the SSR content was empty for the text, so we need to generate a new text
		// node and insert it after the last sibling
		if (next_sibling === null) {
			last_sibling?.after(text);
		} else {
			next_sibling.before(text);
		}
		set_hydrate_node(text);
		return text;
	}

	set_hydrate_node(next_sibling);
	return /** @type {TemplateNode} */ (next_sibling);
}

/**
 * @template {Node} N
 * @param {N} node
 * @returns {void}
 */
function clear_text_content(node) {
	node.textContent = '';
}

/**
 * Returns `true` if we're updating the current block, for example `condition` in
 * an `{#if condition}` block just changed. In this case, the branch should be
 * appended (or removed) at the same time as other updates within the
 * current `<svelte:boundary>`
 */
function should_defer_append() {
	if (!async_mode_flag) return false;
	if (eager_block_effects !== null) return false;

	var flags = /** @type {Effect} */ (active_effect).f;
	return (flags & EFFECT_RAN) !== 0;
}

/**
 *
 * @param {string} tag
 * @param {string} [namespace]
 * @param {string} [is]
 * @returns
 */
function create_element(tag, namespace, is) {
	let options = is ? { is } : undefined;
	if (namespace) {
		return document.createElementNS(namespace, tag, options);
	}
	return document.createElement(tag, options);
}

function create_fragment() {
	return document.createDocumentFragment();
}

/**
 * @param {string} data
 * @returns
 */
function create_comment(data = '') {
	return document.createComment(data);
}

/**
 * @param {Element} element
 * @param {string} key
 * @param {string} value
 * @returns
 */
function set_attribute(element, key, value = '') {
	if (key.startsWith('xlink:')) {
		element.setAttributeNS('http://www.w3.org/1999/xlink', key, value);
		return;
	}
	return element.setAttribute(key, value);
}

/**
 * @param {HTMLElement} dom
 * @param {boolean} value
 * @returns {void}
 */
function autofocus(dom, value) {
	if (value) {
		const body = document.body;
		dom.autofocus = true;

		queue_micro_task(() => {
			if (document.activeElement === body) {
				dom.focus();
			}
		});
	}
}

/**
 * The child of a textarea actually corresponds to the defaultValue property, so we need
 * to remove it upon hydration to avoid a bug when someone resets the form value.
 * @param {HTMLTextAreaElement} dom
 * @returns {void}
 */
function remove_textarea_child(dom) {
	if (hydrating && get_first_child(dom) !== null) {
		clear_text_content(dom);
	}
}

let listening_to_form_reset = false;

function add_form_reset_listener() {
	if (!listening_to_form_reset) {
		listening_to_form_reset = true;
		document.addEventListener(
			'reset',
			(evt) => {
				// Needs to happen one tick later or else the dom properties of the form
				// elements have not updated to their reset values yet
				Promise.resolve().then(() => {
					if (!evt.defaultPrevented) {
						for (const e of /**@type {HTMLFormElement} */ (evt.target).elements) {
							// @ts-expect-error
							e.__on_r?.();
						}
					}
				});
			},
			// In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
			{ capture: true }
		);
	}
}

/**
 * Fires the handler once immediately (unless corresponding arg is set to `false`),
 * then listens to the given events until the render effect context is destroyed
 * @param {EventTarget} target
 * @param {Array<string>} events
 * @param {(event?: Event) => void} handler
 * @param {any} call_handler_immediately
 */
function listen(target, events, handler, call_handler_immediately = true) {
	if (call_handler_immediately) {
		handler();
	}

	for (var name of events) {
		target.addEventListener(name, handler);
	}

	teardown(() => {
		for (var name of events) {
			target.removeEventListener(name, handler);
		}
	});
}

/**
 * @template T
 * @param {() => T} fn
 */
function without_reactive_context(fn) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		return fn();
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}

/**
 * Listen to the given event, and then instantiate a global form reset listener if not already done,
 * to notify all bindings when the form is reset
 * @param {HTMLElement} element
 * @param {string} event
 * @param {(is_reset?: true) => void} handler
 * @param {(is_reset?: true) => void} [on_reset]
 */
function listen_to_event_and_reset_event(element, event, handler, on_reset = handler) {
	element.addEventListener(event, () => without_reactive_context(handler));
	// @ts-expect-error
	const prev = element.__on_r;
	if (prev) {
		// special case for checkbox that can have multiple binds (group & checked)
		// @ts-expect-error
		element.__on_r = () => {
			prev();
			on_reset(true);
		};
	} else {
		// @ts-expect-error
		element.__on_r = () => on_reset(true);
	}

	add_form_reset_listener();
}

/** @import { ComponentContext, ComponentContextLegacy, Derived, Effect, TemplateNode, TransitionManager } from '#client' */

/**
 * @param {'$effect' | '$effect.pre' | '$inspect'} rune
 */
function validate_effect(rune) {
	if (active_effect === null) {
		if (active_reaction === null) {
			effect_orphan();
		}

		effect_in_unowned_derived();
	}

	if (is_destroying_effect) {
		effect_in_teardown();
	}
}

/**
 * @param {Effect} effect
 * @param {Effect} parent_effect
 */
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) {
		parent_effect.last = parent_effect.first = effect;
	} else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}

/**
 * @param {number} type
 * @param {null | (() => void | (() => void))} fn
 * @param {boolean} sync
 * @param {boolean} push
 * @returns {Effect}
 */
function create_effect(type, fn, sync, push = true) {
	var parent = active_effect;

	if (parent !== null && (parent.f & INERT) !== 0) {
		type |= INERT;
	}

	/** @type {Effect} */
	var effect = {
		ctx: component_context,
		deps: null,
		nodes_start: null,
		nodes_end: null,
		f: type | DIRTY | CONNECTED,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		transitions: null,
		wv: 0,
		ac: null
	};

	if (sync) {
		try {
			update_effect(effect);
			effect.f |= EFFECT_RAN;
		} catch (e) {
			destroy_effect(effect);
			throw e;
		}
	} else if (fn !== null) {
		schedule_effect(effect);
	}

	if (push) {
		/** @type {Effect | null} */
		var e = effect;

		// if an effect has already ran and doesn't need to be kept in the tree
		// (because it won't re-run, has no DOM, and has no teardown etc)
		// then we skip it and go to its child (if any)
		if (
			sync &&
			e.deps === null &&
			e.teardown === null &&
			e.nodes_start === null &&
			e.first === e.last && // either `null`, or a singular child
			(e.f & EFFECT_PRESERVED) === 0
		) {
			e = e.first;
			if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
				e.f |= EFFECT_TRANSPARENT;
			}
		}

		if (e !== null) {
			e.parent = parent;

			if (parent !== null) {
				push_effect(e, parent);
			}

			// if we're in a derived, add the effect there too
			if (
				active_reaction !== null &&
				(active_reaction.f & DERIVED) !== 0 &&
				(type & ROOT_EFFECT) === 0
			) {
				var derived = /** @type {Derived} */ (active_reaction);
				(derived.effects ??= []).push(e);
			}
		}
	}

	return effect;
}

/**
 * Internal representation of `$effect.tracking()`
 * @returns {boolean}
 */
function effect_tracking() {
	return active_reaction !== null && !untracking;
}

/**
 * @param {() => void} fn
 */
function teardown(fn) {
	const effect = create_effect(RENDER_EFFECT, null, false);
	set_signal_status(effect, CLEAN);
	effect.teardown = fn;
	return effect;
}

/**
 * Internal representation of `$effect(...)`
 * @param {() => void | (() => void)} fn
 */
function user_effect(fn) {
	validate_effect();

	// Non-nested `$effect(...)` in a component should be deferred
	// until the component is mounted
	var flags = /** @type {Effect} */ (active_effect).f;
	var defer = !active_reaction && (flags & BRANCH_EFFECT) !== 0 && (flags & EFFECT_RAN) === 0;

	if (defer) {
		// Top-level `$effect(...)` in an unmounted component — defer until mount
		var context = /** @type {ComponentContext} */ (component_context);
		(context.e ??= []).push(fn);
	} else {
		// Everything else — create immediately
		return create_user_effect(fn);
	}
}

/**
 * @param {() => void | (() => void)} fn
 */
function create_user_effect(fn) {
	return create_effect(EFFECT | USER_EFFECT, fn, false);
}

/**
 * Internal representation of `$effect.pre(...)`
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
function user_pre_effect(fn) {
	validate_effect();
	return create_effect(RENDER_EFFECT | USER_EFFECT, fn, true);
}

/** @param {() => void | (() => void)} fn */
function eager_effect(fn) {
	return create_effect(EAGER_EFFECT, fn, true);
}

/**
 * Internal representation of `$effect.root(...)`
 * @param {() => void | (() => void)} fn
 * @returns {() => void}
 */
function effect_root(fn) {
	Batch.ensure();
	const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);

	return () => {
		destroy_effect(effect);
	};
}

/**
 * An effect root whose children can transition out
 * @param {() => void} fn
 * @returns {(options?: { outro?: boolean }) => Promise<void>}
 */
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);

	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) {
				pause_effect(effect, () => {
					destroy_effect(effect);
					fulfil(undefined);
				});
			} else {
				destroy_effect(effect);
				fulfil(undefined);
			}
		});
	};
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
function effect(fn) {
	return create_effect(EFFECT, fn, false);
}

/**
 * Internal representation of `$: ..`
 * @param {() => any} deps
 * @param {() => void | (() => void)} fn
 */
function legacy_pre_effect(deps, fn) {
	var context = /** @type {ComponentContextLegacy} */ (component_context);

	/** @type {{ effect: null | Effect, ran: boolean, deps: () => any }} */
	var token = { effect: null, ran: false, deps };

	context.l.$.push(token);

	token.effect = render_effect(() => {
		deps();

		// If this legacy pre effect has already run before the end of the reset, then
		// bail out to emulate the same behavior.
		if (token.ran) return;

		token.ran = true;
		untrack(fn);
	});
}

function legacy_pre_effect_reset() {
	var context = /** @type {ComponentContextLegacy} */ (component_context);

	render_effect(() => {
		// Run dirty `$:` statements
		for (var token of context.l.$) {
			token.deps();

			var effect = token.effect;

			// If the effect is CLEAN, then make it MAYBE_DIRTY. This ensures we traverse through
			// the effects dependencies and correctly ensure each dependency is up-to-date.
			if ((effect.f & CLEAN) !== 0) {
				set_signal_status(effect, MAYBE_DIRTY);
			}

			if (is_dirty(effect)) {
				update_effect(effect);
			}

			token.ran = false;
		}
	});
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
function async_effect(fn) {
	return create_effect(ASYNC | EFFECT_PRESERVED, fn, true);
}

/**
 * @param {() => void | (() => void)} fn
 * @returns {Effect}
 */
function render_effect(fn, flags = 0) {
	return create_effect(RENDER_EFFECT | flags, fn, true);
}

/**
 * @param {(...expressions: any) => void | (() => void)} fn
 * @param {Array<() => any>} sync
 * @param {Array<() => Promise<any>>} async
 * @param {Array<Promise<void>>} blockers
 * @param {boolean} defer
 */
function template_effect(fn, sync = [], async = [], blockers = [], defer = false) {
	flatten(blockers, sync, async, (values) => {
		create_effect(defer ? EFFECT : RENDER_EFFECT, () => fn(...values.map(get)), true);
	});
}

/**
 * @param {(() => void)} fn
 * @param {number} flags
 */
function block(fn, flags = 0) {
	var effect = create_effect(BLOCK_EFFECT | flags, fn, true);
	return effect;
}

/**
 * @param {(() => void)} fn
 * @param {boolean} [push]
 */
function branch(fn, push = true) {
	return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn, true, push);
}

/**
 * @param {Effect} effect
 */
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}

/**
 * @param {Effect} signal
 * @param {boolean} remove_dom
 * @returns {void}
 */
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;

	while (effect !== null) {
		const controller = effect.ac;

		if (controller !== null) {
			without_reactive_context(() => {
				controller.abort(STALE_REACTION);
			});
		}

		var next = effect.next;

		if ((effect.f & ROOT_EFFECT) !== 0) {
			// this is now an independent root
			effect.parent = null;
		} else {
			destroy_effect(effect, remove_dom);
		}

		effect = next;
	}
}

/**
 * @param {Effect} signal
 * @returns {void}
 */
function destroy_block_effect_children(signal) {
	var effect = signal.first;

	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & BRANCH_EFFECT) === 0) {
			destroy_effect(effect);
		}
		effect = next;
	}
}

/**
 * @param {Effect} effect
 * @param {boolean} [remove_dom]
 * @returns {void}
 */
function destroy_effect(effect, remove_dom = true) {
	var removed = false;

	if (
		(remove_dom || (effect.f & HEAD_EFFECT) !== 0) &&
		effect.nodes_start !== null &&
		effect.nodes_end !== null
	) {
		remove_effect_dom(effect.nodes_start, /** @type {TemplateNode} */ (effect.nodes_end));
		removed = true;
	}

	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	set_signal_status(effect, DESTROYED);

	var transitions = effect.transitions;

	if (transitions !== null) {
		for (const transition of transitions) {
			transition.stop();
		}
	}

	execute_effect_teardown(effect);

	var parent = effect.parent;

	// If the parent doesn't have any children, then skip this work altogether
	if (parent !== null && parent.first !== null) {
		unlink_effect(effect);
	}

	// `first` and `child` are nulled out in destroy_effect_children
	// we don't null out `parent` so that error propagation can work correctly
	effect.next =
		effect.prev =
		effect.teardown =
		effect.ctx =
		effect.deps =
		effect.fn =
		effect.nodes_start =
		effect.nodes_end =
		effect.ac =
			null;
}

/**
 *
 * @param {TemplateNode | null} node
 * @param {TemplateNode} end
 */
function remove_effect_dom(node, end) {
	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

		node.remove();
		node = next;
	}
}

/**
 * Detach an effect from the effect tree, freeing up memory and
 * reducing the amount of work that happens on subsequent traversals
 * @param {Effect} effect
 */
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;

	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;

	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}

/**
 * When a block effect is removed, we don't immediately destroy it or yank it
 * out of the DOM, because it might have transitions. Instead, we 'pause' it.
 * It stays around (in memory, and in the DOM) until outro transitions have
 * completed, and if the state change is reversed then we _resume_ it.
 * A paused effect does not update, and the DOM subtree becomes inert.
 * @param {Effect} effect
 * @param {() => void} [callback]
 * @param {boolean} [destroy]
 */
function pause_effect(effect, callback, destroy = true) {
	/** @type {TransitionManager[]} */
	var transitions = [];

	pause_children(effect, transitions, true);

	run_out_transitions(transitions, () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	});
}

/**
 * @param {TransitionManager[]} transitions
 * @param {() => void} fn
 */
function run_out_transitions(transitions, fn) {
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) {
			transition.out(check);
		}
	} else {
		fn();
	}
}

/**
 * @param {Effect} effect
 * @param {TransitionManager[]} transitions
 * @param {boolean} local
 */
function pause_children(effect, transitions, local) {
	if ((effect.f & INERT) !== 0) return;
	effect.f ^= INERT;

	if (effect.transitions !== null) {
		for (const transition of effect.transitions) {
			if (transition.is_global || local) {
				transitions.push(transition);
			}
		}
	}

	var child = effect.first;

	while (child !== null) {
		var sibling = child.next;
		var transparent =
			(child.f & EFFECT_TRANSPARENT) !== 0 ||
			// If this is a branch effect without a block effect parent,
			// it means the parent block effect was pruned. In that case,
			// transparency information was transferred to the branch effect.
			((child.f & BRANCH_EFFECT) !== 0 && (effect.f & BLOCK_EFFECT) !== 0);
		// TODO we don't need to call pause_children recursively with a linked list in place
		// it's slightly more involved though as we have to account for `transparent` changing
		// through the tree.
		pause_children(child, transitions, transparent ? local : false);
		child = sibling;
	}
}

/**
 * The opposite of `pause_effect`. We call this if (for example)
 * `x` becomes falsy then truthy: `{#if x}...{/if}`
 * @param {Effect} effect
 */
function resume_effect(effect) {
	resume_children(effect, true);
}

/**
 * @param {Effect} effect
 * @param {boolean} local
 */
function resume_children(effect, local) {
	if ((effect.f & INERT) === 0) return;
	effect.f ^= INERT;

	// If a dependency of this effect changed while it was paused,
	// schedule the effect to update. we don't use `is_dirty`
	// here because we don't want to eagerly recompute a derived like
	// `{#if foo}{foo.bar()}{/if}` if `foo` is now `undefined
	if ((effect.f & CLEAN) === 0) {
		set_signal_status(effect, DIRTY);
		schedule_effect(effect);
	}

	var child = effect.first;

	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0;
		// TODO we don't need to call resume_children recursively with a linked list in place
		// it's slightly more involved though as we have to account for `transparent` changing
		// through the tree.
		resume_children(child, transparent ? local : false);
		child = sibling;
	}

	if (effect.transitions !== null) {
		for (const transition of effect.transitions) {
			if (transition.is_global || local) {
				transition.in();
			}
		}
	}
}

function aborted(effect = /** @type {Effect} */ (active_effect)) {
	return (effect.f & DESTROYED) !== 0;
}

/**
 * @param {Effect} effect
 * @param {DocumentFragment} fragment
 */
function move_effect(effect, fragment) {
	var node = effect.nodes_start;
	var end = effect.nodes_end;

	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

		fragment.append(node);
		node = next;
	}
}

/** @import { Value } from '#client' */

/**
 * @type {Set<Value> | null}
 * @deprecated
 */
let captured_signals = null;

/**
 * Capture an array of all the signals that are read when `fn` is called
 * @template T
 * @param {() => T} fn
 */
function capture_signals(fn) {
	var previous_captured_signals = captured_signals;

	try {
		captured_signals = new Set();

		untrack(fn);

		if (previous_captured_signals !== null) {
			for (var signal of captured_signals) {
				previous_captured_signals.add(signal);
			}
		}

		return captured_signals;
	} finally {
		captured_signals = previous_captured_signals;
	}
}

/**
 * Invokes a function and captures all signals that are read during the invocation,
 * then invalidates them.
 * @param {() => any} fn
 * @deprecated
 */
function invalidate_inner_signals(fn) {
	for (var signal of capture_signals(fn)) {
		internal_set(signal, signal.v);
	}
}

/** @import { Derived, Effect, Reaction, Signal, Source, Value } from '#client' */

let is_updating_effect = false;

/** @param {boolean} value */
function set_is_updating_effect(value) {
	is_updating_effect = value;
}

let is_destroying_effect = false;

/** @param {boolean} value */
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}

/** @type {null | Reaction} */
let active_reaction = null;

let untracking = false;

/** @param {null | Reaction} reaction */
function set_active_reaction(reaction) {
	active_reaction = reaction;
}

/** @type {null | Effect} */
let active_effect = null;

/** @param {null | Effect} effect */
function set_active_effect(effect) {
	active_effect = effect;
}

/**
 * When sources are created within a reaction, reading and writing
 * them within that reaction should not cause a re-run
 * @type {null | Source[]}
 */
let current_sources = null;

/** @param {Value} value */
function push_reaction_value(value) {
	if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & DERIVED) !== 0)) {
		if (current_sources === null) {
			current_sources = [value];
		} else {
			current_sources.push(value);
		}
	}
}

/**
 * The dependencies of the reaction that is currently being executed. In many cases,
 * the dependencies are unchanged between runs, and so this will be `null` unless
 * and until a new dependency is accessed — we track this via `skipped_deps`
 * @type {null | Value[]}
 */
let new_deps = null;

let skipped_deps = 0;

/**
 * Tracks writes that the effect it's executed in doesn't listen to yet,
 * so that the dependency can be added to the effect later on if it then reads it
 * @type {null | Source[]}
 */
let untracked_writes = null;

/** @param {null | Source[]} value */
function set_untracked_writes(value) {
	untracked_writes = value;
}

/**
 * @type {number} Used by sources and deriveds for handling updates.
 * Version starts from 1 so that unowned deriveds differentiate between a created effect and a run one for tracing
 **/
let write_version = 1;

/** @type {number} Used to version each read of a source of derived to avoid duplicating depedencies inside a reaction */
let read_version = 0;

let update_version = read_version;

/** @param {number} value */
function set_update_version(value) {
	update_version = value;
}

function increment_write_version() {
	return ++write_version;
}

/**
 * Determines whether a derived or effect is dirty.
 * If it is MAYBE_DIRTY, will set the status to CLEAN
 * @param {Reaction} reaction
 * @returns {boolean}
 */
function is_dirty(reaction) {
	var flags = reaction.f;

	if ((flags & DIRTY) !== 0) {
		return true;
	}

	if (flags & DERIVED) {
		reaction.f &= ~WAS_MARKED;
	}

	if ((flags & MAYBE_DIRTY) !== 0) {
		var dependencies = reaction.deps;

		if (dependencies !== null) {
			var length = dependencies.length;

			for (var i = 0; i < length; i++) {
				var dependency = dependencies[i];

				if (is_dirty(/** @type {Derived} */ (dependency))) {
					update_derived(/** @type {Derived} */ (dependency));
				}

				if (dependency.wv > reaction.wv) {
					return true;
				}
			}
		}

		if (
			(flags & CONNECTED) !== 0 &&
			// During time traveling we don't want to reset the status so that
			// traversal of the graph in the other batches still happens
			batch_values === null
		) {
			set_signal_status(reaction, CLEAN);
		}
	}

	return false;
}

/**
 * @param {Value} signal
 * @param {Effect} effect
 * @param {boolean} [root]
 */
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;

	if (!async_mode_flag && current_sources?.includes(signal)) {
		return;
	}

	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];

		if ((reaction.f & DERIVED) !== 0) {
			schedule_possible_effect_self_invalidation(/** @type {Derived} */ (reaction), effect, false);
		} else if (effect === reaction) {
			if (root) {
				set_signal_status(reaction, DIRTY);
			} else if ((reaction.f & CLEAN) !== 0) {
				set_signal_status(reaction, MAYBE_DIRTY);
			}
			schedule_effect(/** @type {Effect} */ (reaction));
		}
	}
}

/** @param {Reaction} reaction */
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;

	var flags = reaction.f;

	new_deps = /** @type {null | Value[]} */ (null);
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;

	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;

	if (reaction.ac !== null) {
		without_reactive_context(() => {
			/** @type {AbortController} */ (reaction.ac).abort(STALE_REACTION);
		});

		reaction.ac = null;
	}

	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn = /** @type {Function} */ (reaction.fn);
		var result = fn();
		var deps = reaction.deps;

		if (new_deps !== null) {
			var i;

			remove_reactions(reaction, skipped_deps);

			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) {
					deps[skipped_deps + i] = new_deps[i];
				}
			} else {
				reaction.deps = deps = new_deps;
			}

			if (is_updating_effect && effect_tracking() && (reaction.f & CONNECTED) !== 0) {
				for (i = skipped_deps; i < deps.length; i++) {
					(deps[i].reactions ??= []).push(reaction);
				}
			}
		} else if (deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}

		// If we're inside an effect and we have untracked writes, then we need to
		// ensure that if any of those untracked writes result in re-invalidation
		// of the current effect, then that happens accordingly
		if (
			is_runes() &&
			untracked_writes !== null &&
			!untracking &&
			deps !== null &&
			(reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
		) {
			for (i = 0; i < /** @type {Source[]} */ (untracked_writes).length; i++) {
				schedule_possible_effect_self_invalidation(
					untracked_writes[i],
					/** @type {Effect} */ (reaction)
				);
			}
		}

		// If we are returning to an previous reaction then
		// we need to increment the read version to ensure that
		// any dependencies in this reaction aren't marked with
		// the same version
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;

			if (untracked_writes !== null) {
				if (previous_untracked_writes === null) {
					previous_untracked_writes = untracked_writes;
				} else {
					previous_untracked_writes.push(.../** @type {Source[]} */ (untracked_writes));
				}
			}
		}

		if ((reaction.f & ERROR_VALUE) !== 0) {
			reaction.f ^= ERROR_VALUE;
		}

		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}

/**
 * @template V
 * @param {Reaction} signal
 * @param {Value<V>} dependency
 * @returns {void}
 */
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) {
				reactions = dependency.reactions = null;
			} else {
				// Swap with last element and then remove.
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}

	// If the derived has no reactions, then we can disconnect it from the graph,
	// allowing it to either reconnect in the future, or be GC'd by the VM.
	if (
		reactions === null &&
		(dependency.f & DERIVED) !== 0 &&
		// Destroying a child effect while updating a parent effect can cause a dependency to appear
		// to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
		// allows us to skip the expensive work of disconnecting and immediately reconnecting it
		(new_deps === null || !new_deps.includes(dependency))
	) {
		set_signal_status(dependency, MAYBE_DIRTY);
		// If we are working with a derived that is owned by an effect, then mark it as being
		// disconnected and remove the mark flag, as it cannot be reliably removed otherwise
		if ((dependency.f & CONNECTED) !== 0) {
			dependency.f ^= CONNECTED;
			dependency.f &= ~WAS_MARKED;
		}
		// Disconnect any reactions owned by this reaction
		destroy_derived_effects(/** @type {Derived} **/ (dependency));
		remove_reactions(/** @type {Derived} **/ (dependency), 0);
	}
}

/**
 * @param {Reaction} signal
 * @param {number} start_index
 * @returns {void}
 */
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;

	for (var i = start_index; i < dependencies.length; i++) {
		remove_reaction(signal, dependencies[i]);
	}
}

/**
 * @param {Effect} effect
 * @returns {void}
 */
function update_effect(effect) {
	var flags = effect.f;

	if ((flags & DESTROYED) !== 0) {
		return;
	}

	set_signal_status(effect, CLEAN);

	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;

	active_effect = effect;
	is_updating_effect = true;

	try {
		if ((flags & BLOCK_EFFECT) !== 0) {
			destroy_block_effect_children(effect);
		} else {
			destroy_effect_children(effect);
		}

		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === 'function' ? teardown : null;
		effect.wv = write_version;

		// In DEV, increment versions of any sources that were written to during the effect,
		// so that they are correctly marked as dirty when the effect re-runs
		var dep; if (DEV && tracing_mode_flag && (effect.f & DIRTY) !== 0 && effect.deps !== null) ;
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;
	}
}

/**
 * Returns a promise that resolves once any pending state changes have been applied.
 * @returns {Promise<void>}
 */
async function tick() {
	if (async_mode_flag) {
		return new Promise((f) => {
			// Race them against each other - in almost all cases requestAnimationFrame will fire first,
			// but e.g. in case the window is not focused or a view transition happens, requestAnimationFrame
			// will be delayed and setTimeout helps us resolve fast enough in that case
			requestAnimationFrame(() => f());
			setTimeout(() => f());
		});
	}

	await Promise.resolve();

	// By calling flushSync we guarantee that any pending state changes are applied after one tick.
	// TODO look into whether we can make flushing subsequent updates synchronously in the future.
	flushSync();
}

/**
 * Returns a promise that resolves once any state changes, and asynchronous work resulting from them,
 * have resolved and the DOM has been updated
 * @returns {Promise<void>}
 * @since 5.36
 */
function settled() {
	return Batch.ensure().settled();
}

/**
 * @template V
 * @param {Value<V>} signal
 * @returns {V}
 */
function get(signal) {
	var flags = signal.f;
	var is_derived = (flags & DERIVED) !== 0;

	captured_signals?.add(signal);

	// Register the dependency on the current reaction signal.
	if (active_reaction !== null && !untracking) {
		// if we're in a derived that is being read inside an _async_ derived,
		// it's possible that the effect was already destroyed. In this case,
		// we don't add the dependency, because that would create a memory leak
		var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;

		if (!destroyed && !current_sources?.includes(signal)) {
			var deps = active_reaction.deps;

			if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
				// we're in the effect init/update cycle
				if (signal.rv < read_version) {
					signal.rv = read_version;

					// If the signal is accessing the same dependencies in the same
					// order as it did last time, increment `skipped_deps`
					// rather than updating `new_deps`, which creates GC cost
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
						skipped_deps++;
					} else if (new_deps === null) {
						new_deps = [signal];
					} else if (!new_deps.includes(signal)) {
						new_deps.push(signal);
					}
				}
			} else {
				// we're adding a dependency outside the init/update cycle
				// (i.e. after an `await`)
				(active_reaction.deps ??= []).push(signal);

				var reactions = signal.reactions;

				if (reactions === null) {
					signal.reactions = [active_reaction];
				} else if (!reactions.includes(active_reaction)) {
					reactions.push(active_reaction);
				}
			}
		}
	}

	if (is_destroying_effect) {
		if (old_values.has(signal)) {
			return old_values.get(signal);
		}

		if (is_derived) {
			var derived = /** @type {Derived} */ (signal);

			var value = derived.v;

			// if the derived is dirty and has reactions, or depends on the values that just changed, re-execute
			// (a derived can be maybe_dirty due to the effect destroy removing its last reaction)
			if (
				((derived.f & CLEAN) === 0 && derived.reactions !== null) ||
				depends_on_old_values(derived)
			) {
				value = execute_derived(derived);
			}

			old_values.set(derived, value);

			return value;
		}
	} else if (is_derived) {
		derived = /** @type {Derived} */ (signal);

		if (batch_values?.has(derived)) {
			return batch_values.get(derived);
		}

		if (is_dirty(derived)) {
			update_derived(derived);
		}

		if (is_updating_effect && effect_tracking() && (derived.f & CONNECTED) === 0) {
			reconnect(derived);
		}
	} else if (batch_values?.has(signal)) {
		return batch_values.get(signal);
	}

	if ((signal.f & ERROR_VALUE) !== 0) {
		throw signal.v;
	}

	return signal.v;
}

/**
 * (Re)connect a disconnected derived, so that it is notified
 * of changes in `mark_reactions`
 * @param {Derived} derived
 */
function reconnect(derived) {
	if (derived.deps === null) return;

	derived.f ^= CONNECTED;

	for (const dep of derived.deps) {
		(dep.reactions ??= []).push(derived);

		if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
			reconnect(/** @type {Derived} */ (dep));
		}
	}
}

/** @param {Derived} derived */
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true; // we don't know, so assume the worst
	if (derived.deps === null) return false;

	for (const dep of derived.deps) {
		if (old_values.has(dep)) {
			return true;
		}

		if ((dep.f & DERIVED) !== 0 && depends_on_old_values(/** @type {Derived} */ (dep))) {
			return true;
		}
	}

	return false;
}

/**
 * Like `get`, but checks for `undefined`. Used for `var` declarations because they can be accessed before being declared
 * @template V
 * @param {Value<V> | undefined} signal
 * @returns {V | undefined}
 */
function safe_get(signal) {
	return signal && get(signal);
}

/**
 * When used inside a [`$derived`](https://svelte.dev/docs/svelte/$derived) or [`$effect`](https://svelte.dev/docs/svelte/$effect),
 * any state read inside `fn` will not be treated as a dependency.
 *
 * ```ts
 * $effect(() => {
 *   // this will run when `data` changes, but not when `time` changes
 *   save(data, {
 *     timestamp: untrack(() => time)
 *   });
 * });
 * ```
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}

const STATUS_MASK = -7169;

/**
 * @param {Signal} signal
 * @param {number} status
 * @returns {void}
 */
function set_signal_status(signal, status) {
	signal.f = (signal.f & STATUS_MASK) | status;
}

/**
 * @param {Record<string | symbol, unknown>} obj
 * @param {Array<string | symbol>} keys
 * @returns {Record<string | symbol, unknown>}
 */
function exclude_from_object(obj, keys) {
	/** @type {Record<string | symbol, unknown>} */
	var result = {};

	for (var key in obj) {
		if (!keys.includes(key)) {
			result[key] = obj[key];
		}
	}

	for (var symbol of Object.getOwnPropertySymbols(obj)) {
		if (Object.propertyIsEnumerable.call(obj, symbol) && !keys.includes(symbol)) {
			result[symbol] = obj[symbol];
		}
	}

	return result;
}

/**
 * Possibly traverse an object and read all its properties so that they're all reactive in case this is `$state`.
 * Does only check first level of an object for performance reasons (heuristic should be good for 99% of all cases).
 * @param {any} value
 * @returns {void}
 */
function deep_read_state(value) {
	if (typeof value !== 'object' || !value || value instanceof EventTarget) {
		return;
	}

	if (STATE_SYMBOL in value) {
		deep_read(value);
	} else if (!Array.isArray(value)) {
		for (let key in value) {
			const prop = value[key];
			if (typeof prop === 'object' && prop && STATE_SYMBOL in prop) {
				deep_read(prop);
			}
		}
	}
}

/**
 * Deeply traverse an object and read all its properties
 * so that they're all reactive in case this is `$state`
 * @param {any} value
 * @param {Set<any>} visited
 * @returns {void}
 */
function deep_read(value, visited = new Set()) {
	if (
		typeof value === 'object' &&
		value !== null &&
		// We don't want to traverse DOM elements
		!(value instanceof EventTarget) &&
		!visited.has(value)
	) {
		visited.add(value);
		// When working with a possible SvelteDate, this
		// will ensure we capture changes to it.
		if (value instanceof Date) {
			value.getTime();
		}
		for (let key in value) {
			try {
				deep_read(value[key], visited);
			} catch (e) {
				// continue
			}
		}
		const proto = get_prototype_of(value);
		if (
			proto !== Object.prototype &&
			proto !== Array.prototype &&
			proto !== Map.prototype &&
			proto !== Set.prototype &&
			proto !== Date.prototype
		) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) {
					try {
						get.call(value);
					} catch (e) {
						// continue
					}
				}
			}
		}
	}
}

/** @type {Set<string>} */
const all_registered_events = new Set();

/** @type {Set<(events: Array<string>) => void>} */
const root_event_handles = new Set();

/**
 * SSR adds onload and onerror attributes to catch those events before the hydration.
 * This function detects those cases, removes the attributes and replays the events.
 * @param {HTMLElement} dom
 */
function replay_events(dom) {
	if (!hydrating) return;

	dom.removeAttribute('onload');
	dom.removeAttribute('onerror');
	// @ts-expect-error
	const event = dom.__e;
	if (event !== undefined) {
		// @ts-expect-error
		dom.__e = undefined;
		queueMicrotask(() => {
			if (dom.isConnected) {
				dom.dispatchEvent(event);
			}
		});
	}
}

/**
 * @param {string} event_name
 * @param {EventTarget} dom
 * @param {EventListener} [handler]
 * @param {AddEventListenerOptions} [options]
 */
function create_event(event_name, dom, handler, options = {}) {
	/**
	 * @this {EventTarget}
	 */
	function target_handler(/** @type {Event} */ event) {
		if (!options.capture) {
			// Only call in the bubble phase, else delegated events would be called before the capturing events
			handle_event_propagation.call(dom, event);
		}
		if (!event.cancelBubble) {
			return without_reactive_context(() => {
				return handler?.call(this, event);
			});
		}
	}

	// Chrome has a bug where pointer events don't work when attached to a DOM element that has been cloned
	// with cloneNode() and the DOM element is disconnected from the document. To ensure the event works, we
	// defer the attachment till after it's been appended to the document. TODO: remove this once Chrome fixes
	// this bug. The same applies to wheel events and touch events.
	if (
		event_name.startsWith('pointer') ||
		event_name.startsWith('touch') ||
		event_name === 'wheel'
	) {
		queue_micro_task(() => {
			dom.addEventListener(event_name, target_handler, options);
		});
	} else {
		dom.addEventListener(event_name, target_handler, options);
	}

	return target_handler;
}

/**
 * Attaches an event handler to an element and returns a function that removes the handler. Using this
 * rather than `addEventListener` will preserve the correct order relative to handlers added declaratively
 * (with attributes like `onclick`), which use event delegation for performance reasons
 *
 * @param {EventTarget} element
 * @param {string} type
 * @param {EventListener} handler
 * @param {AddEventListenerOptions} [options]
 */
function on(element, type, handler, options = {}) {
	var target_handler = create_event(type, element, handler, options);

	return () => {
		element.removeEventListener(type, target_handler, options);
	};
}

/**
 * @param {string} event_name
 * @param {Element} dom
 * @param {EventListener} [handler]
 * @param {boolean} [capture]
 * @param {boolean} [passive]
 * @returns {void}
 */
function event(event_name, dom, handler, capture, passive) {
	var options = { capture, passive };
	var target_handler = create_event(event_name, dom, handler, options);

	if (
		dom === document.body ||
		// @ts-ignore
		dom === window ||
		// @ts-ignore
		dom === document ||
		// Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
		dom instanceof HTMLMediaElement
	) {
		teardown(() => {
			dom.removeEventListener(event_name, target_handler, options);
		});
	}
}

/**
 * @param {Array<string>} events
 * @returns {void}
 */
function delegate(events) {
	for (var i = 0; i < events.length; i++) {
		all_registered_events.add(events[i]);
	}

	for (var fn of root_event_handles) {
		fn(events);
	}
}

// used to store the reference to the currently propagated event
// to prevent garbage collection between microtasks in Firefox
// If the event object is GCed too early, the expando __root property
// set on the event object is lost, causing the event delegation
// to process the event twice
let last_propagated_event = null;

/**
 * @this {EventTarget}
 * @param {Event} event
 * @returns {void}
 */
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document = /** @type {Node} */ (handler_element).ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target = /** @type {null | Element} */ (path[0] || event.target);

	last_propagated_event = event;

	// composedPath contains list of nodes the event has propagated through.
	// We check __root to skip all nodes below it in case this is a
	// parent of the __root node, which indicates that there's nested
	// mounted apps. In this case we don't want to trigger events multiple times.
	var path_idx = 0;

	// the `last_propagated_event === event` check is redundant, but
	// without it the variable will be DCE'd and things will
	// fail mysteriously in Firefox
	// @ts-expect-error is added below
	var handled_at = last_propagated_event === event && event.__root;

	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (
			at_idx !== -1 &&
			(handler_element === document || handler_element === /** @type {any} */ (window))
		) {
			// This is the fallback document listener or a window listener, but the event was already handled
			// -> ignore, but set handle_at to document/window so that we're resetting the event
			// chain in case someone manually dispatches the same event object again.
			// @ts-expect-error
			event.__root = handler_element;
			return;
		}

		// We're deliberately not skipping if the index is higher, because
		// someone could create an event programmatically and emit it multiple times,
		// in which case we want to handle the whole propagation chain properly each time.
		// (this will only be a false negative if the event is dispatched multiple times and
		// the fallback document listener isn't reached in between, but that's super rare)
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) {
			// handle_idx can theoretically be -1 (happened in some JSDOM testing scenarios with an event listener on the window object)
			// so guard against that, too, and assume that everything was handled at this point.
			return;
		}

		if (at_idx <= handler_idx) {
			path_idx = at_idx;
		}
	}

	current_target = /** @type {Element} */ (path[path_idx] || event.target);
	// there can only be one delegated event per element, and we either already handled the current target,
	// or this is the very first target in the chain which has a non-delegated listener, in which case it's safe
	// to handle a possible delegated event on it later (through the root delegation listener for example).
	if (current_target === handler_element) return;

	// Proxy currentTarget to correct target
	define_property(event, 'currentTarget', {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});

	// This started because of Chromium issue https://chromestatus.com/feature/5128696823545856,
	// where removal or moving of of the DOM can cause sync `blur` events to fire, which can cause logic
	// to run inside the current `active_reaction`, which isn't what we want at all. However, on reflection,
	// it's probably best that all event handled by Svelte have this behaviour, as we don't really want
	// an event handler to run in the context of another reaction or effect.
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);

	try {
		/**
		 * @type {unknown}
		 */
		var throw_error;
		/**
		 * @type {unknown[]}
		 */
		var other_errors = [];

		while (current_target !== null) {
			/** @type {null | Element} */
			var parent_element =
				current_target.assignedSlot ||
				current_target.parentNode ||
				/** @type {any} */ (current_target).host ||
				null;

			try {
				// @ts-expect-error
				var delegated = current_target['__' + event_name];

				if (
					delegated != null &&
					(!(/** @type {any} */ (current_target).disabled) ||
						// DOM could've been updated already by the time this is reached, so we check this as well
						// -> the target could not have been disabled because it emits the event in the first place
						event.target === current_target)
				) {
					delegated.call(current_target, event);
				}
			} catch (error) {
				if (throw_error) {
					other_errors.push(error);
				} else {
					throw_error = error;
				}
			}
			if (event.cancelBubble || parent_element === handler_element || parent_element === null) {
				break;
			}
			current_target = parent_element;
		}

		if (throw_error) {
			for (let error of other_errors) {
				// Throw the rest of the errors, one-by-one on a microtask
				queueMicrotask(() => {
					throw error;
				});
			}
			throw throw_error;
		}
	} finally {
		// @ts-expect-error is used above
		event.__root = handler_element;
		// @ts-ignore remove proxy on currentTarget
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}

/**
 * In dev, warn if an event handler is not a function, as it means the
 * user probably called the handler or forgot to add a `() =>`
 * @param {() => (event: Event, ...args: any) => void} thunk
 * @param {EventTarget} element
 * @param {[Event, ...any]} args
 * @param {any} component
 * @param {[number, number]} [loc]
 * @param {boolean} [remove_parens]
 */
function apply(
	thunk,
	element,
	args,
	component,
	loc,
	has_side_effects = false,
	remove_parens = false
) {
	let handler;
	let error;

	try {
		handler = thunk();
	} catch (e) {
		error = e;
	}

	if (typeof handler !== 'function' && (has_side_effects || handler != null || error)) {
		const filename = component?.[FILENAME];
		loc ? ` at ${filename}:${loc[0]}:${loc[1]}` : ` in ${filename}`;
		const phase = args[0]?.eventPhase < Event.BUBBLING_PHASE ? 'capture' : '';
		args[0]?.type + phase;

		event_handler_invalid();

		if (error) {
			throw error;
		}
	}
	handler?.apply(element, args);
}

export { snippet_without_render_tag as $, set_active_effect as A, active_effect as B, effect_root as C, effect_tracking as D, safe_not_equal as E, run_all as F, object_keys as G, define_property as H, get_descriptor as I, current_batch as J, resume_effect as K, destroy_effect as L, pause_effect as M, should_defer_append as N, create_text as O, branch as P, hydrating as Q, hydrate_node as R, move_effect as S, hydrate_next as T, block as U, EFFECT_TRANSPARENT as V, get_first_child as W, set_dev_current_component_function as X, dev_current_component_function as Y, svelte_element_invalid_this_value as Z, store_invalid_shape as _, active_reaction as a, unset_context as a$, get_prototype_of as a0, object_prototype as a1, state as a2, deferred as a3, user_derived as a4, update_version as a5, increment as a6, EFFECT_RAN as a7, is_firefox as a8, TEXT_NODE as a9, set_signal_status as aA, MAYBE_DIRTY as aB, PROXY_PATH_SYMBOL as aC, STATE_SYMBOL as aD, DERIVED as aE, ASYNC as aF, get_proxied_value as aG, state_proxy_equality_mismatch as aH, assignment_value_stale as aI, ELEMENT_NODE as aJ, dev_stack as aK, ownership_invalid_binding as aL, ownership_invalid_mutation as aM, component_api_invalid_new as aN, component_api_changed as aO, validate_effect as aP, eager_effect as aQ, get_boundary as aR, skip_nodes as aS, flatten as aT, invalid_snippet_arguments as aU, is_runes as aV, is_promise as aW, queue_micro_task as aX, internal_set as aY, capture as aZ, Batch as a_, set_hydrate_node as aa, COMMENT_NODE as ab, create_fragment as ac, create_comment as ad, create_element as ae, set_attribute as af, DOCUMENT_FRAGMENT_NODE as ag, init_operations as ah, get_next_sibling as ai, set_hydrating as aj, hydration_failed as ak, clear_text_content as al, array_from as am, all_registered_events as an, root_event_handles as ao, component_root as ap, handle_event_propagation as aq, boundary as ar, push as as, hydration_mismatch as at, pop as au, user_pre_effect as av, LEGACY_PROPS as aw, mutable_source as ax, DIRTY as ay, legacy_recursive_reactive_block as az, untrack as b, sibling as b$, is_flushing_sync as b0, read_hydration_instruction as b1, derived_safe_equal as b2, INERT as b3, pause_children as b4, run_out_transitions as b5, template_effect as b6, remove_effect_dom as b7, HEAD_EFFECT as b8, effect as b9, add_svelte_meta as bA, apply as bB, event as bC, replay_events as bD, remove_textarea_child as bE, hydrate_template as bF, next as bG, reset as bH, async_body as bI, for_await_track_reactivity_loss as bJ, run as bK, save as bL, track_reactivity_loss as bM, eager as bN, async_derived as bO, aborted as bP, legacy_pre_effect as bQ, legacy_pre_effect_reset as bR, mutate as bS, update_pre as bT, pending as bU, invalidate_inner_signals as bV, safe_get as bW, exclude_from_object as bX, deep_read as bY, child as bZ, first_child as b_, deep_read_state as ba, listen_to_event_and_reset_event as bb, select_multiple_invalid_value as bc, is as bd, previous_batch as be, add_form_reset_listener as bf, LOADING_ATTR_SYMBOL as bg, get_descriptors as bh, create_event as bi, delegate as bj, autofocus as bk, BLOCK_EFFECT as bl, is_function as bm, without_reactive_context as bn, listen as bo, run$1 as bp, derived as bq, props_invalid_value as br, proxy as bs, DESTROYED as bt, update as bu, is_destroying_effect as bv, run_after_blockers as bw, each_key_duplicate as bx, binding_property_non_reactive as by, console_log_state as bz, component_context as c, $window as c0, $document as c1, fallback as c2, to_array as c3, invalid_default_snippet as c4, invoke_error_boundary as c5, STALE_REACTION as c6, lifecycle_legacy_only as d, fork as e, flushSync as f, get_abort_signal_outside_reaction as g, createContext as h, is_array as i, getContext as j, getAllContexts as k, lifecycle_outside_component as l, hasContext as m, settled as n, noop as o, teardown as p, on as q, render_effect as r, setContext as s, tick as t, user_effect as u, source as v, get as w, set as x, createSubscriber as y, set_active_reaction as z };

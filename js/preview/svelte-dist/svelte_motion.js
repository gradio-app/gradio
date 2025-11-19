import './custom-element-FNtmsENB.js';
import { M as MediaQuery } from './media-query-DA37RLNM.js';
import { w as writable } from './index-35-VEyqc.js';
import { r as raf, l as loop } from './loop-CiZ6Mtf9.js';
import { a2 as state, r as render_effect, x as set, a3 as deferred, o as noop, w as get } from './index-D9jXyWpQ.js';
import { linear } from './svelte_easing.js';
import './legacy-client-BvU2XuMp.js';
import './constants-BMyj1h3a.js';
import './utils-Bmu7F6be.js';
import './index-DZuH9089.js';
import './reactive-value-BysziQ51.js';
import './utils-CJZQEPmE.js';

/**
 * @param {any} obj
 * @returns {obj is Date}
 */
function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}

/** @import { Task } from '#client' */
/** @import { SpringOpts, SpringUpdateOpts, TickContext } from './private.js' */
/** @import { Spring as SpringStore } from './public.js' */

/**
 * @template T
 * @param {TickContext} ctx
 * @param {T} last_value
 * @param {T} current_value
 * @param {T} target_value
 * @returns {T}
 */
function tick_spring(ctx, last_value, current_value, target_value) {
	if (typeof current_value === 'number' || is_date(current_value)) {
		// @ts-ignore
		const delta = target_value - current_value;
		// @ts-ignore
		const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
		const spring = ctx.opts.stiffness * delta;
		const damper = ctx.opts.damping * velocity;
		const acceleration = (spring - damper) * ctx.inv_mass;
		const d = (velocity + acceleration) * ctx.dt;
		if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
			return target_value; // settled
		} else {
			ctx.settled = false; // signal loop to keep ticking
			// @ts-ignore
			return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
		}
	} else if (Array.isArray(current_value)) {
		// @ts-ignore
		return current_value.map((_, i) =>
			// @ts-ignore
			tick_spring(ctx, last_value[i], current_value[i], target_value[i])
		);
	} else if (typeof current_value === 'object') {
		const next_value = {};
		for (const k in current_value) {
			// @ts-ignore
			next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
		}
		// @ts-ignore
		return next_value;
	} else {
		throw new Error(`Cannot spring ${typeof current_value} values`);
	}
}

/**
 * The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
 *
 * @deprecated Use [`Spring`](https://svelte.dev/docs/svelte/svelte-motion#Spring) instead
 * @template [T=any]
 * @param {T} [value]
 * @param {SpringOpts} [opts]
 * @returns {SpringStore<T>}
 */
function spring(value, opts = {}) {
	const store = writable(value);
	const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
	/** @type {number} */
	let last_time;
	/** @type {Task | null} */
	let task;
	/** @type {object} */
	let current_token;

	let last_value = /** @type {T} */ (value);
	let target_value = /** @type {T | undefined} */ (value);

	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;
	/**
	 * @param {T} new_value
	 * @param {SpringUpdateOpts} opts
	 * @returns {Promise<void>}
	 */
	function set(new_value, opts = {}) {
		target_value = new_value;
		const token = (current_token = {});
		if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
			cancel_task = true; // cancel any running animation
			last_time = raf.now();
			last_value = new_value;
			store.set((value = target_value));
			return Promise.resolve();
		} else if (opts.soft) {
			const rate = opts.soft === true ? 0.5 : +opts.soft;
			inv_mass_recovery_rate = 1 / (rate * 60);
			inv_mass = 0; // infinite mass, unaffected by spring forces
		}
		if (!task) {
			last_time = raf.now();
			cancel_task = false;
			task = loop((now) => {
				if (cancel_task) {
					cancel_task = false;
					task = null;
					return false;
				}
				inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);

				// clamp elapsed time to 1/30th of a second, so that longer pauses
				// (blocked thread or inactive tab) don't cause the spring to go haywire
				const elapsed = Math.min(now - last_time, 1000 / 30);

				/** @type {TickContext} */
				const ctx = {
					inv_mass,
					opts: spring,
					settled: true,
					dt: (elapsed * 60) / 1000
				};
				// @ts-ignore
				const next_value = tick_spring(ctx, last_value, value, target_value);
				last_time = now;
				last_value = /** @type {T} */ (value);
				store.set((value = /** @type {T} */ (next_value)));
				if (ctx.settled) {
					task = null;
				}
				return !ctx.settled;
			});
		}
		return new Promise((fulfil) => {
			/** @type {Task} */ (task).promise.then(() => {
				if (token === current_token) fulfil();
			});
		});
	}
	/** @type {SpringStore<T>} */
	// @ts-expect-error - class-only properties are missing
	const spring = {
		set,
		update: (fn, opts) => set(fn(/** @type {T} */ (target_value), /** @type {T} */ (value)), opts),
		subscribe: store.subscribe,
		stiffness,
		damping,
		precision
	};
	return spring;
}

/**
 * A wrapper for a value that behaves in a spring-like fashion. Changes to `spring.target` will cause `spring.current` to
 * move towards it over time, taking account of the `spring.stiffness` and `spring.damping` parameters.
 *
 * ```svelte
 * <script>
 * 	import { Spring } from 'svelte/motion';
 *
 * 	const spring = new Spring(0);
 * </script>
 *
 * <input type="range" bind:value={spring.target} />
 * <input type="range" bind:value={spring.current} disabled />
 * ```
 * @template T
 * @since 5.8.0
 */
class Spring {
	#stiffness = state(0.15);
	#damping = state(0.8);
	#precision = state(0.01);

	#current;
	#target;

	#last_value = /** @type {T} */ (undefined);
	#last_time = 0;

	#inverse_mass = 1;
	#momentum = 0;

	/** @type {import('../internal/client/types').Task | null} */
	#task = null;

	/** @type {ReturnType<typeof deferred> | null} */
	#deferred = null;

	/**
	 * @param {T} value
	 * @param {SpringOpts} [options]
	 */
	constructor(value, options = {}) {
		this.#current = state(value);
		this.#target = state(value);

		if (typeof options.stiffness === 'number') this.#stiffness.v = clamp(options.stiffness, 0, 1);
		if (typeof options.damping === 'number') this.#damping.v = clamp(options.damping, 0, 1);
		if (typeof options.precision === 'number') this.#precision.v = options.precision;
	}

	/**
	 * Create a spring whose value is bound to the return value of `fn`. This must be called
	 * inside an effect root (for example, during component initialisation).
	 *
	 * ```svelte
	 * <script>
	 * 	import { Spring } from 'svelte/motion';
	 *
	 * 	let { number } = $props();
	 *
	 * 	const spring = Spring.of(() => number);
	 * </script>
	 * ```
	 * @template U
	 * @param {() => U} fn
	 * @param {SpringOpts} [options]
	 */
	static of(fn, options) {
		const spring = new Spring(fn(), options);

		render_effect(() => {
			spring.set(fn());
		});

		return spring;
	}

	/** @param {T} value */
	#update(value) {
		set(this.#target, value);

		this.#current.v ??= value;
		this.#last_value ??= this.#current.v;

		if (!this.#task) {
			this.#last_time = raf.now();

			var inv_mass_recovery_rate = 1000 / (this.#momentum * 60);

			this.#task ??= loop((now) => {
				this.#inverse_mass = Math.min(this.#inverse_mass + inv_mass_recovery_rate, 1);

				// clamp elapsed time to 1/30th of a second, so that longer pauses
				// (blocked thread or inactive tab) don't cause the spring to go haywire
				const elapsed = Math.min(now - this.#last_time, 1000 / 30);

				/** @type {import('./private').TickContext} */
				const ctx = {
					inv_mass: this.#inverse_mass,
					opts: {
						stiffness: this.#stiffness.v,
						damping: this.#damping.v,
						precision: this.#precision.v
					},
					settled: true,
					dt: (elapsed * 60) / 1000
				};

				var next = tick_spring(ctx, this.#last_value, this.#current.v, this.#target.v);
				this.#last_value = this.#current.v;
				this.#last_time = now;
				set(this.#current, next);

				if (ctx.settled) {
					this.#task = null;
				}

				return !ctx.settled;
			});
		}

		return this.#task.promise;
	}

	/**
	 * Sets `spring.target` to `value` and returns a `Promise` that resolves if and when `spring.current` catches up to it.
	 *
	 * If `options.instant` is `true`, `spring.current` immediately matches `spring.target`.
	 *
	 * If `options.preserveMomentum` is provided, the spring will continue on its current trajectory for
	 * the specified number of milliseconds. This is useful for things like 'fling' gestures.
	 *
	 * @param {T} value
	 * @param {SpringUpdateOpts} [options]
	 */
	set(value, options) {
		this.#deferred?.reject(new Error('Aborted'));

		if (options?.instant || this.#current.v === undefined) {
			this.#task?.abort();
			this.#task = null;
			set(this.#current, set(this.#target, value));
			this.#last_value = value;
			return Promise.resolve();
		}

		if (options?.preserveMomentum) {
			this.#inverse_mass = 0;
			this.#momentum = options.preserveMomentum;
		}

		var d = (this.#deferred = deferred());
		d.promise.catch(noop);

		this.#update(value).then(() => {
			if (d !== this.#deferred) return;
			d.resolve(undefined);
		});

		return d.promise;
	}

	get current() {
		return get(this.#current);
	}

	get damping() {
		return get(this.#damping);
	}

	set damping(v) {
		set(this.#damping, clamp(v, 0, 1));
	}

	get precision() {
		return get(this.#precision);
	}

	set precision(v) {
		set(this.#precision, v);
	}

	get stiffness() {
		return get(this.#stiffness);
	}

	set stiffness(v) {
		set(this.#stiffness, clamp(v, 0, 1));
	}

	get target() {
		return get(this.#target);
	}

	set target(v) {
		this.set(v);
	}
}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}

/** @import { Task } from '../internal/client/types' */
/** @import { Tweened } from './public' */
/** @import { TweenedOptions } from './private' */

/**
 * @template T
 * @param {T} a
 * @param {T} b
 * @returns {(t: number) => T}
 */
function get_interpolator(a, b) {
	if (a === b || a !== a) return () => a;

	const type = typeof a;
	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (Array.isArray(a)) {
		const arr = /** @type {Array<any>} */ (b).map((bi, i) => {
			return get_interpolator(/** @type {Array<any>} */ (a)[i], bi);
		});

		// @ts-ignore
		return (t) => arr.map((fn) => fn(t));
	}

	if (type === 'object') {
		if (!a || !b) {
			throw new Error('Object cannot be null');
		}

		if (is_date(a) && is_date(b)) {
			const an = a.getTime();
			const bn = b.getTime();
			const delta = bn - an;

			// @ts-ignore
			return (t) => new Date(an + t * delta);
		}

		const keys = Object.keys(b);

		/** @type {Record<string, (t: number) => T>} */
		const interpolators = {};
		keys.forEach((key) => {
			// @ts-ignore
			interpolators[key] = get_interpolator(a[key], b[key]);
		});

		// @ts-ignore
		return (t) => {
			/** @type {Record<string, any>} */
			const result = {};
			keys.forEach((key) => {
				result[key] = interpolators[key](t);
			});
			return result;
		};
	}

	if (type === 'number') {
		const delta = /** @type {number} */ (b) - /** @type {number} */ (a);
		// @ts-ignore
		return (t) => a + t * delta;
	}

	// for non-numeric values, snap to the final value immediately
	return () => b;
}

/**
 * A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.
 *
 * @deprecated Use [`Tween`](https://svelte.dev/docs/svelte/svelte-motion#Tween) instead
 * @template T
 * @param {T} [value]
 * @param {TweenedOptions<T>} [defaults]
 * @returns {Tweened<T>}
 */
function tweened(value, defaults = {}) {
	const store = writable(value);
	/** @type {Task} */
	let task;
	let target_value = value;
	/**
	 * @param {T} new_value
	 * @param {TweenedOptions<T>} [opts]
	 */
	function set(new_value, opts) {
		target_value = new_value;

		if (value == null) {
			store.set((value = new_value));
			return Promise.resolve();
		}

		/** @type {Task | null} */
		let previous_task = task;

		let started = false;
		let {
			delay = 0,
			duration = 400,
			easing = linear,
			interpolate = get_interpolator
		} = { ...defaults, ...opts };

		if (duration === 0) {
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			store.set((value = target_value));
			return Promise.resolve();
		}

		const start = raf.now() + delay;

		/** @type {(t: number) => T} */
		let fn;
		task = loop((now) => {
			if (now < start) return true;
			if (!started) {
				fn = interpolate(/** @type {any} */ (value), new_value);
				if (typeof duration === 'function')
					duration = duration(/** @type {any} */ (value), new_value);
				started = true;
			}
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			const elapsed = now - start;
			if (elapsed > /** @type {number} */ (duration)) {
				store.set((value = new_value));
				return false;
			}
			// @ts-ignore
			store.set((value = fn(easing(elapsed / duration))));
			return true;
		});
		return task.promise;
	}
	return {
		set,
		update: (fn, opts) =>
			set(fn(/** @type {any} */ (target_value), /** @type {any} */ (value)), opts),
		subscribe: store.subscribe
	};
}

/**
 * A wrapper for a value that tweens smoothly to its target value. Changes to `tween.target` will cause `tween.current` to
 * move towards it over time, taking account of the `delay`, `duration` and `easing` options.
 *
 * ```svelte
 * <script>
 * 	import { Tween } from 'svelte/motion';
 *
 * 	const tween = new Tween(0);
 * </script>
 *
 * <input type="range" bind:value={tween.target} />
 * <input type="range" bind:value={tween.current} disabled />
 * ```
 * @template T
 * @since 5.8.0
 */
class Tween {
	#current;
	#target;

	/** @type {TweenedOptions<T>} */
	#defaults;

	/** @type {import('../internal/client/types').Task | null} */
	#task = null;

	/**
	 * @param {T} value
	 * @param {TweenedOptions<T>} options
	 */
	constructor(value, options = {}) {
		this.#current = state(value);
		this.#target = state(value);
		this.#defaults = options;
	}

	/**
	 * Create a tween whose value is bound to the return value of `fn`. This must be called
	 * inside an effect root (for example, during component initialisation).
	 *
	 * ```svelte
	 * <script>
	 * 	import { Tween } from 'svelte/motion';
	 *
	 * 	let { number } = $props();
	 *
	 * 	const tween = Tween.of(() => number);
	 * </script>
	 * ```
	 * @template U
	 * @param {() => U} fn
	 * @param {TweenedOptions<U>} [options]
	 */
	static of(fn, options) {
		const tween = new Tween(fn(), options);

		render_effect(() => {
			tween.set(fn());
		});

		return tween;
	}

	/**
	 * Sets `tween.target` to `value` and returns a `Promise` that resolves if and when `tween.current` catches up to it.
	 *
	 * If `options` are provided, they will override the tween's defaults.
	 * @param {T} value
	 * @param {TweenedOptions<T>} [options]
	 * @returns
	 */
	set(value, options) {
		set(this.#target, value);

		let {
			delay = 0,
			duration = 400,
			easing = linear,
			interpolate = get_interpolator
		} = { ...this.#defaults, ...options };

		if (duration === 0) {
			this.#task?.abort();
			set(this.#current, value);
			return Promise.resolve();
		}

		const start = raf.now() + delay;

		/** @type {(t: number) => T} */
		let fn;
		let started = false;
		let previous_task = this.#task;

		this.#task = loop((now) => {
			if (now < start) {
				return true;
			}

			if (!started) {
				started = true;

				const prev = this.#current.v;

				fn = interpolate(prev, value);

				if (typeof duration === 'function') {
					duration = duration(prev, value);
				}

				previous_task?.abort();
			}

			const elapsed = now - start;

			if (elapsed > /** @type {number} */ (duration)) {
				set(this.#current, value);
				return false;
			}

			set(this.#current, fn(easing(elapsed / /** @type {number} */ (duration))));
			return true;
		});

		return this.#task.promise;
	}

	get current() {
		return get(this.#current);
	}

	get target() {
		return get(this.#target);
	}

	set target(v) {
		this.set(v);
	}
}

/**
 * A [media query](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery) that matches if the user [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
 *
 * ```svelte
 * <script>
 * 	import { prefersReducedMotion } from 'svelte/motion';
 * 	import { fly } from 'svelte/transition';
 *
 * 	let visible = $state(false);
 * </script>
 *
 * <button onclick={() => visible = !visible}>
 * 	toggle
 * </button>
 *
 * {#if visible}
 * 	<p transition:fly={{ y: prefersReducedMotion.current ? 0 : 200 }}>
 * 		flies in, unless the user prefers reduced motion
 * 	</p>
 * {/if}
 * ```
 * @type {MediaQuery}
 * @since 5.7.0
 */
const prefersReducedMotion = /*@__PURE__*/ new MediaQuery(
	'(prefers-reduced-motion: reduce)'
);

export { Spring, Tween, prefersReducedMotion, spring, tweened };

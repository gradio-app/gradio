import { q as on, v as source, w as get, x as set } from './index-D9jXyWpQ.js';
import { R as ReactiveValue } from './reactive-value-BysziQ51.js';
import './custom-element-FNtmsENB.js';
import './index-DZuH9089.js';
import './constants-BMyj1h3a.js';
import './legacy-client-BvU2XuMp.js';
import './utils-Bmu7F6be.js';

/**
 * `scrollX.current` is a reactive view of `window.scrollX`. On the server it is `undefined`.
 * @since 5.11.0
 */
const scrollX = new ReactiveValue(
	() => window.scrollX ,
	(update) => on(window, 'scroll', update)
);

/**
 * `scrollY.current` is a reactive view of `window.scrollY`. On the server it is `undefined`.
 * @since 5.11.0
 */
const scrollY = new ReactiveValue(
	() => window.scrollY ,
	(update) => on(window, 'scroll', update)
);

/**
 * `innerWidth.current` is a reactive view of `window.innerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
const innerWidth = new ReactiveValue(
	() => window.innerWidth ,
	(update) => on(window, 'resize', update)
);

/**
 * `innerHeight.current` is a reactive view of `window.innerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
const innerHeight = new ReactiveValue(
	() => window.innerHeight ,
	(update) => on(window, 'resize', update)
);

/**
 * `outerWidth.current` is a reactive view of `window.outerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
const outerWidth = new ReactiveValue(
	() => window.outerWidth ,
	(update) => on(window, 'resize', update)
);

/**
 * `outerHeight.current` is a reactive view of `window.outerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
const outerHeight = new ReactiveValue(
	() => window.outerHeight ,
	(update) => on(window, 'resize', update)
);

/**
 * `screenLeft.current` is a reactive view of `window.screenLeft`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
const screenLeft = new ReactiveValue(
	() => window.screenLeft ,
	(update) => {
		let value = window.screenLeft;

		let frame = requestAnimationFrame(function check() {
			frame = requestAnimationFrame(check);

			if (value !== (value = window.screenLeft)) {
				update();
			}
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}
);

/**
 * `screenTop.current` is a reactive view of `window.screenTop`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
const screenTop = new ReactiveValue(
	() => window.screenTop ,
	(update) => {
		let value = window.screenTop;

		let frame = requestAnimationFrame(function check() {
			frame = requestAnimationFrame(check);

			if (value !== (value = window.screenTop)) {
				update();
			}
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}
);

/**
 * `online.current` is a reactive view of `navigator.onLine`. On the server it is `undefined`.
 * @since 5.11.0
 */
const online = new ReactiveValue(
	() => navigator.onLine ,
	(update) => {
		const unsub_online = on(window, 'online', update);
		const unsub_offline = on(window, 'offline', update);
		return () => {
			unsub_online();
			unsub_offline();
		};
	}
);

/**
 * `devicePixelRatio.current` is a reactive view of `window.devicePixelRatio`. On the server it is `undefined`.
 * Note that behaviour differs between browsers — on Chrome it will respond to the current zoom level,
 * on Firefox and Safari it won't.
 * @type {{ get current(): number | undefined }}
 * @since 5.11.0
 */
const devicePixelRatio = /* @__PURE__ */ new (class DevicePixelRatio {
	#dpr = source(window.devicePixelRatio );

	#update() {
		const off = on(
			window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),
			'change',
			() => {
				set(this.#dpr, window.devicePixelRatio);

				off();
				this.#update();
			}
		);
	}

	constructor() {
		{
			this.#update();
		}
	}

	get current() {
		get(this.#dpr);
		return window.devicePixelRatio ;
	}
})();

export { devicePixelRatio, innerHeight, innerWidth, online, outerHeight, outerWidth, screenLeft, screenTop, scrollX, scrollY };

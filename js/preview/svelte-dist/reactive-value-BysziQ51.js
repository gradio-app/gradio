import { y as createSubscriber } from './index-D9jXyWpQ.js';

/**
 * @template T
 */
class ReactiveValue {
	#fn;
	#subscribe;

	/**
	 *
	 * @param {() => T} fn
	 * @param {(update: () => void) => void} onsubscribe
	 */
	constructor(fn, onsubscribe) {
		this.#fn = fn;
		this.#subscribe = createSubscriber(onsubscribe);
	}

	get current() {
		this.#subscribe();
		return this.#fn();
	}
}

export { ReactiveValue as R };

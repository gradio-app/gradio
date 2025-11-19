import { J as current_batch, K as resume_effect, L as destroy_effect, M as pause_effect, N as should_defer_append, O as create_text, P as branch, Q as hydrating, R as hydrate_node, S as move_effect, T as hydrate_next, p as teardown, U as block, V as EFFECT_TRANSPARENT, W as get_first_child, X as set_dev_current_component_function, Y as dev_current_component_function } from './index-D9jXyWpQ.js';
import { b as create_fragment_from_html, d as assign_nodes } from './legacy-client-BvU2XuMp.js';
import { p as prevent_snippet_stringification } from './validate-DJCmPiAv.js';

/** @import { Effect, TemplateNode } from '#client' */

/**
 * @typedef {{ effect: Effect, fragment: DocumentFragment }} Branch
 */

/**
 * @template Key
 */
class BranchManager {
	/** @type {TemplateNode} */
	anchor;

	/** @type {Map<Batch, Key>} */
	#batches = new Map();

	/** @type {Map<Key, Effect>} */
	#onscreen = new Map();

	/** @type {Map<Key, Branch>} */
	#offscreen = new Map();

	/**
	 * Whether to pause (i.e. outro) on change, or destroy immediately.
	 * This is necessary for `<svelte:element>`
	 */
	#transition = true;

	/**
	 * @param {TemplateNode} anchor
	 * @param {boolean} transition
	 */
	constructor(anchor, transition = true) {
		this.anchor = anchor;
		this.#transition = transition;
	}

	#commit = () => {
		var batch = /** @type {Batch} */ (current_batch);

		// if this batch was made obsolete, bail
		if (!this.#batches.has(batch)) return;

		var key = /** @type {Key} */ (this.#batches.get(batch));

		var onscreen = this.#onscreen.get(key);

		if (onscreen) {
			// effect is already in the DOM — abort any current outro
			resume_effect(onscreen);
		} else {
			// effect is currently offscreen. put it in the DOM
			var offscreen = this.#offscreen.get(key);

			if (offscreen) {
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);

				// remove the anchor...
				/** @type {TemplateNode} */ (offscreen.fragment.lastChild).remove();

				// ...and append the fragment
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
			}
		}

		for (const [b, k] of this.#batches) {
			this.#batches.delete(b);

			if (b === batch) {
				// keep values for newer batches
				break;
			}

			const offscreen = this.#offscreen.get(k);

			if (offscreen) {
				// for older batches, destroy offscreen effects
				// as they will never be committed
				destroy_effect(offscreen.effect);
				this.#offscreen.delete(k);
			}
		}

		// outro/destroy all onscreen effects...
		for (const [k, effect] of this.#onscreen) {
			// ...except the one that was just committed
			if (k === key) continue;

			const on_destroy = () => {
				const keys = Array.from(this.#batches.values());

				if (keys.includes(k)) {
					// keep the effect offscreen, as another batch will need it
					var fragment = document.createDocumentFragment();
					move_effect(effect, fragment);

					fragment.append(create_text()); // TODO can we avoid this?

					this.#offscreen.set(k, { effect, fragment });
				} else {
					destroy_effect(effect);
				}

				this.#onscreen.delete(k);
			};

			if (this.#transition || !onscreen) {
				pause_effect(effect, on_destroy, false);
			} else {
				on_destroy();
			}
		}
	};

	/**
	 * @param {Batch} batch
	 */
	#discard = (batch) => {
		this.#batches.delete(batch);

		const keys = Array.from(this.#batches.values());

		for (const [k, branch] of this.#offscreen) {
			if (!keys.includes(k)) {
				destroy_effect(branch.effect);
				this.#offscreen.delete(k);
			}
		}
	};

	/**
	 *
	 * @param {any} key
	 * @param {null | ((target: TemplateNode) => void)} fn
	 */
	ensure(key, fn) {
		var batch = /** @type {Batch} */ (current_batch);
		var defer = should_defer_append();

		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
			if (defer) {
				var fragment = document.createDocumentFragment();
				var target = create_text();

				fragment.append(target);

				this.#offscreen.set(key, {
					effect: branch(() => fn(target)),
					fragment
				});
			} else {
				this.#onscreen.set(
					key,
					branch(() => fn(this.anchor))
				);
			}
		}

		this.#batches.set(batch, key);

		if (defer) {
			for (const [k, effect] of this.#onscreen) {
				if (k === key) {
					batch.skipped_effects.delete(effect);
				} else {
					batch.skipped_effects.add(effect);
				}
			}

			for (const [k, branch] of this.#offscreen) {
				if (k === key) {
					batch.skipped_effects.delete(branch.effect);
				} else {
					batch.skipped_effects.add(branch.effect);
				}
			}

			batch.oncommit(this.#commit);
			batch.ondiscard(this.#discard);
		} else {
			if (hydrating) {
				this.anchor = hydrate_node;
			}

			this.#commit();
		}
	}
}

/** @import { Snippet } from 'svelte' */
/** @import { TemplateNode } from '#client' */
/** @import { Getters } from '#shared' */

/**
 * @template {(node: TemplateNode, ...args: any[]) => void} SnippetFn
 * @param {TemplateNode} node
 * @param {() => SnippetFn | null | undefined} get_snippet
 * @param {(() => any)[]} args
 * @returns {void}
 */
function snippet(node, get_snippet, ...args) {
	var branches = new BranchManager(node);

	block(() => {
		const snippet = get_snippet() ?? null;

		branches.ensure(snippet, snippet && ((anchor) => snippet(anchor, ...args)));
	}, EFFECT_TRANSPARENT);
}

/**
 * In development, wrap the snippet function so that it passes validation, and so that the
 * correct component context is set for ownership checks
 * @param {any} component
 * @param {(node: TemplateNode, ...args: any[]) => void} fn
 */
function wrap_snippet(component, fn) {
	const snippet = (/** @type {TemplateNode} */ node, /** @type {any[]} */ ...args) => {
		var previous_component_function = dev_current_component_function;
		set_dev_current_component_function(component);

		try {
			return fn(node, ...args);
		} finally {
			set_dev_current_component_function(previous_component_function);
		}
	};

	prevent_snippet_stringification(snippet);

	return snippet;
}

/**
 * Create a snippet programmatically
 * @template {unknown[]} Params
 * @param {(...params: Getters<Params>) => {
 *   render: () => string
 *   setup?: (element: Element) => void | (() => void)
 * }} fn
 * @returns {Snippet<Params>}
 */
function createRawSnippet(fn) {
	// @ts-expect-error the types are a lie
	return (/** @type {TemplateNode} */ anchor, /** @type {Getters<Params>} */ ...params) => {
		var snippet = fn(...params);

		/** @type {Element} */
		var element;

		if (hydrating) {
			element = /** @type {Element} */ (hydrate_node);
			hydrate_next();
		} else {
			var html = snippet.render().trim();
			var fragment = create_fragment_from_html(html);
			element = /** @type {Element} */ (get_first_child(fragment));

			anchor.before(element);
		}

		const result = snippet.setup?.(element);
		assign_nodes(element, element);

		if (typeof result === 'function') {
			teardown(result);
		}
	};
}

export { BranchManager as B, createRawSnippet as c, snippet as s, wrap_snippet as w };

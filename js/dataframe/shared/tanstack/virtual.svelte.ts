import {
	Virtualizer,
	elementScroll,
	observeElementOffset,
	observeElementRect,
	type PartialKeys,
	type VirtualizerOptions
} from "@tanstack/virtual-core";
import { untrack } from "svelte";

export type { VirtualItem } from "@tanstack/virtual-core";

/**
 * Creates a reactive TanStack Virtualizer for Svelte 5.
 *
 * Returns a getter function that returns the virtualizer instance.
 * Call the getter inside $derived or template expressions to create
 * reactive dependencies on the virtualizer state.
 */
export function createSvelteVirtualizer<
	TScrollElement extends Element,
	TItemElement extends Element
>(
	options: PartialKeys<
		VirtualizerOptions<TScrollElement, TItemElement>,
		"observeElementRect" | "observeElementOffset" | "scrollToFn"
	>
): {
	instance: Virtualizer<TScrollElement, TItemElement>;
	virtualItems: () => ReturnType<
		Virtualizer<TScrollElement, TItemElement>["getVirtualItems"]
	>;
	totalSize: () => number;
} {
	let version = $state(0);

	const virtualizer = new Virtualizer<TScrollElement, TItemElement>({
		observeElementRect: observeElementRect,
		observeElementOffset: observeElementOffset,
		scrollToFn: elementScroll,
		...options,
		onChange: (instance, sync) => {
			if (sync) {
				version += 1;
			} else {
				queueMicrotask(() => {
					version += 1;
				});
			}
			options.onChange?.(instance, sync);
		}
	});

	$effect(() => {
		const cleanup = virtualizer._didMount();
		untrack(() => {
			version += 1;
		});
		return cleanup;
	});

	let prev_count = 0;

	$effect(() => {
		const current_count = options.count;
		virtualizer.setOptions({
			observeElementRect: observeElementRect,
			observeElementOffset: observeElementOffset,
			scrollToFn: elementScroll,
			...options,
			onChange: (instance, sync) => {
				if (sync) {
					version += 1;
				} else {
					queueMicrotask(() => {
						version += 1;
					});
				}
				options.onChange?.(instance, sync);
			}
		});

		if (current_count !== prev_count) {
			// `virtualItems()` only recomputes when `version` changes, and
			// `setOptions()` does not notify on its own, so a row count change alone
			// left the rendered window frozen: rows that arrived after the first
			// render stayed invisible until an unrelated scroll or resize forced a
			// recalculation. Bumping `version` re-reads the window while keeping the
			// measured row sizes that `measure()` would throw away.
			// See https://github.com/gradio-app/gradio/issues/13611 and #13272.
			version += 1;
		}
		prev_count = current_count;
	});

	$effect.pre(() => {
		void version;
		virtualizer._willUpdate();
	});

	return {
		instance: virtualizer,
		virtualItems: () => {
			void version;
			return virtualizer.getVirtualItems();
		},
		totalSize: () => {
			void version;
			return virtualizer.getTotalSize();
		}
	};
}

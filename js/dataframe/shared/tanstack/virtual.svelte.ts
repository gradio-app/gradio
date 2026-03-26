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
	virtualItems: () => ReturnType<Virtualizer<TScrollElement, TItemElement>["getVirtualItems"]>;
	totalSize: () => number;
} {
	// Reactive version counter. Only bumped from virtualizer's onChange.
	let version = $state(0);

	const virtualizer = new Virtualizer<TScrollElement, TItemElement>({
		observeElementRect: observeElementRect,
		observeElementOffset: observeElementOffset,
		scrollToFn: elementScroll,
		...options,
		onChange: (instance, sync) => {
			// Bump version to notify Svelte that virtualizer state changed.
			// Use queueMicrotask for async updates to avoid mid-render writes.
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
		// After mount, bump version so virtualItems() re-evaluates
		untrack(() => {
			version += 1;
		});
		return cleanup;
	});

	// Sync options changes (count, estimateSize, etc) to the virtualizer.
	// This reads `options` reactively via the getter properties.
	$effect(() => {
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
	});

	// Notify virtualizer that a render is about to happen.
	// Only depends on `version` - does NOT read options.
	$effect.pre(() => {
		void version;
		virtualizer._willUpdate();
	});

	return {
		instance: virtualizer,
		virtualItems: () => {
			void version; // create reactive dependency
			return virtualizer.getVirtualItems();
		},
		totalSize: () => {
			void version;
			return virtualizer.getTotalSize();
		}
	};
}

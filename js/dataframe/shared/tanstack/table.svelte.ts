import {
	createTable,
	type RowData,
	type TableOptions,
	type TableOptionsResolved,
	type TableState
} from "@tanstack/table-core";

/**
 * Merges objects while preserving property getters for lazy evaluation.
 * Properties are defined as getters that look up values from sources in
 * reverse order at access time. This is critical: it means reading a
 * property from the merged result doesn't happen until the property is
 * actually accessed, not when mergeObjects is called.
 */
export function mergeObjects(...sources: any): any {
	const target: Record<string, any> = {};
	for (let i = 0; i < sources.length; i++) {
		let source = sources[i];
		if (typeof source === "function") source = source();
		if (source) {
			const descriptors = Object.getOwnPropertyDescriptors(source);
			for (const key in descriptors) {
				if (key in target) continue;
				Object.defineProperty(target, key, {
					enumerable: true,
					get() {
						for (let j = sources.length - 1; j >= 0; j--) {
							let s = sources[j];
							if (typeof s === "function") s = s();
							const v = (s || {})[key];
							if (v !== undefined) return v;
						}
					}
				});
			}
		}
	}
	return target;
}

/**
 * Creates a reactive TanStack Table for Svelte 5.
 *
 * The reactivity works through mergeObjects' lazy getters:
 * - $effect.pre calls table.setOptions() with a merged object
 * - The merged object has lazy getters for `data`, `columns`, `state`, etc.
 * - TanStack stores this object but doesn't deep-read all properties immediately
 * - When getRowModel() is called (in $derived), TanStack reads `data` and `columns`
 *   through the lazy getters, which read the reactive $state/$derived values
 * - onStateChange fires when TanStack mutates its own state → bumps version
 * - version is read by getRowModel/getHeaderGroups → $derived re-evaluates
 */
export function createSvelteTable<TData extends RowData>(
	options: TableOptions<TData>
) {
	const resolvedOptions: TableOptionsResolved<TData> = mergeObjects(
		{
			state: {},
			onStateChange() {},
			renderFallbackValue: null,
			mergeOptions: (
				defaultOptions: TableOptions<TData>,
				opts: Partial<TableOptions<TData>>
			) => {
				return mergeObjects(defaultOptions, opts);
			}
		},
		options
	);

	const table = createTable(resolvedOptions);
	let state = $state<Partial<TableState>>(table.initialState);
	let version = $state(0);

	function updateOptions(): void {
		table.setOptions(() => {
			// Always merge from resolvedOptions instead of prev to prevent
			// unbounded getter chains. Using prev would add a new mergeObjects
			// layer on every call; properties not in the overrides would have
			// to traverse every previous layer, causing stack overflow.
			// TanStack's setOptions already re-applies feature defaults via
			// mergeOptions, so we don't lose any internal defaults.
			return mergeObjects(resolvedOptions, options, {
				state: mergeObjects(state, options.state || {}),
				onStateChange: (updater: any) => {
					if (updater instanceof Function) state = updater(state);
					else state = mergeObjects(state, updater);
					version += 1;
					options.onStateChange?.(updater);
				}
			});
		});
	}

	// Initial sync
	updateOptions();

	// Re-sync when options change. Because mergeObjects uses lazy getters,
	// this effect's tracked dependencies are only the properties that
	// table.setOptions() eagerly reads (which is minimal — mostly just
	// checking if the options object reference changed).
	$effect.pre(() => {
		updateOptions();
	});

	return {
		getRowModel: () => {
			void version;
			return table.getRowModel();
		},
		getHeaderGroups: () => {
			void version;
			return table.getHeaderGroups();
		},
		getColumn: (id: string) => {
			void version;
			return table.getColumn(id);
		}
	};
}

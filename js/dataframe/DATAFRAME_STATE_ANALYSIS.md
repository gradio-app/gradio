# Dataframe Package Analysis & State Architecture Proposal

This document captures how the current `js/dataframe` package works today (state surfaces, DOM listeners, data flow) and outlines a Svelte 5 rune-centric refactor that consolidates state, minimizes reactive fan-out, and simplifies data access.

## 1. Component Surfaces & Responsibilities

| File | Responsibility | Key Notes |
| --- | --- | --- |
| `Index.svelte` | Public wrapper exported to Gradio. | Instantiates `shared/Table.svelte`, wires block chrome (`Block`, `StatusTracker`), and relays all DOM events via `gradio.dispatch`. |
| `shared/Table.svelte` | The core interactive table. | Owns most view-model state (row/column data, DOM refs, virtualization, drag handlers, cell menu, upload). Directly mutates and re-syncs data, then delegates to the shared context actions. |
| `shared/context/dataframe_context.ts` | Global context for Table descendants. | Stores config, search/sort/filter metadata, and UI state (selection, menus, editing) in a Svelte store; exposes ~35 imperative actions used across cells, headers, menus, and keyboard handlers. |
| `shared/VirtualTable.svelte` | Virtualized body renderer. | Maintains scroll window, row height map, and viewport measurements; consumes `items` (already filtered/sorted rows) and emits scroll info. |
| `shared/EditableCell.svelte`, `TableCell.svelte`, `TableHeader.svelte`, `Toolbar.svelte`, `CellMenu*.svelte`, etc. | Presentational pieces. | They consume context actions/state exposed by `Table.svelte` and translate DOM events (click, blur, drag, copy, search input) into context calls. |

Supporting utilities under `shared/utils` (selection, table, keyboard, drag, sort/filter, data processing) provide the bulk of pure logic, but each utility operates on raw arrays passed down from `Table.svelte`.

## 2. Current State Surfaces

### 2.1 Context store (`shared/context/dataframe_context.ts`)

- **Config** — flags passed from props at mount (`show_fullscreen_button`, `wrap`, `max_height`, `static_columns`, etc.). These values never change after context creation.
- **Search state** — `current_search_query` (string or `null`). Only mutated by `handle_search`, but filtering occurs outside the store.
- **Sort state** — `sort_columns`, `row_order`, and `initial_data` snapshot (`data`, `display_value`, `styling`). Sorting mutates the shared `context.data` array in-place (`sort_table_data`).
- **Filter state** — `filter_columns` and an `initial_data` snapshot similar to sort. Column filter toggles are stored here, but filtered data is again produced in `Table.svelte`.
- **UI state** — everything selection-related: `selected_cells`, a single `selected` cell, `editing` coordinates, header editing flags, active menus, active menu buttons, copy flash indicator.
- **Mutable references** — The context keeps references to the live `data`, `headers`, `display_value`, `styling`, DOM element map (`els`), parent container, and accessor helpers (`get_data_at`, `get_row`, `get_column`). `Table.svelte` updates these references whenever its own reactive variables change.
- **Actions** — ~40 functions mutate state or perform operations. Examples:
  - Selection: `handle_cell_click`, `handle_select_row`, `set_selected_cells`, etc.
  - Structural edits: `add_row`, `add_col`, `delete_row_at`, etc., which mutate the provided data arrays.
  - Sorting/filtering toggles plus resets (which restore previous snapshots by deep cloning JSON).
  - Event dispatchers: `trigger_change` performs `dequal` comparisons, dispatches `change`, `edit`, `input` events back to `Index.svelte`, and resets sort/filter state when headers change.
  - Menu toggles, copy flashing, drag helpers, etc.

### 2.2 `shared/Table.svelte`

Alongside props, this component owns several local `let` variables and reactive statements:

- **Data copies** — `data` (array of `{id, value, display_value}` objects), `_headers` with generated IDs, `old_val`/`old_headers` snapshots to detect structural changes.
- **Metadata** — `display_value`, `styling`, `data_binding`, `search_results`, `filtered_to_original_map`.
- **DOM references** — `els` map, `cells` array, `parent`, `table`, `viewport`, `menu` positions. Column widths are derived by measuring a hidden `<table>` (opacity 0) before applying them to the virtualized body.
- **Virtualization state** — `table_height`, `scrollbar_width`, `selected_index`, `is_visible`, `max`, `width_calculated`.
- **UI toggles** — `dragging`, `active menus`, `copy_flash`, `drag_state`, `drag_handlers`.
- **Reactive statements** — dozens of `$:` blocks recalculate headers, data, search results, filtered rows, derived widths, copy flash, row selection positions, etc. Many of these mutate both local state and context references, which means the canonical data lives in multiple mutable structures.
- **Lifecycle** — `onMount` installs `IntersectionObserver`, document click listeners (for outside-click), window resize listener, document-level mouseup. Cleanup happens in the returned teardown.

### 2.3 Supporting modules

- **VirtualTable** keeps its own `height_map`, buffered `start/end` indices, and uses `requestAnimationFrame` for scroll-to-index logic.
- **Toolbar** tracks copy feedback and search query text internally (via `copied` + `timer`).
- **FilterMenu**, `CellMenu`, `Drag` utils, `Keyboard` utils each have local state, but primarily rely on context-provided actions to mutate the shared data.

## 3. DOM & Event Flow

1. **Lifecycle / global listeners**
   - `Table.svelte` adds `IntersectionObserver` (visibility toggles width recalculation), document click (close menus), window resize (clears menus, recalculates widths), and document mouseup (finish drag).
   - Drag-and-drop upload is enabled by wrapping the virtual table in `@gradio/upload`'s `<Upload>` component.

2. **Selection, editing, keyboard**
   - `TableCell` delegates `mousedown` and `contextmenu` to `df_actions.handle_cell_click` / `toggle_cell_menu`.
   - `EditableCell` dispatches `blur` events, which call `handle_cell_blur` → `save_cell_value` → `context.dispatch("change")`.
   - Keyboard handling (arrow keys, Enter, Tab, Delete, clipboard copy) is centralized in `utils/keyboard_utils.ts`, which consumes context actions (`move_cursor`, `set_selected_cells`, etc.).
   - Drag selection is implemented via `create_drag_handlers`, which tracks `drag_state` and uses selection utils to grow the highlighted range.

3. **Sorting, filtering, search**
   - Header menus trigger `df_actions.handle_sort` / `reset_sort_state`. Sorting mutates `data` via `sort_data_and_preserve_selection`.
   - Column filter menus call `df_actions.handle_filter`, but the actual filtering into `data`/`search_results` happens in `Table.svelte` via `filter_data_and_preserve_selection`.
   - Toolbar search stores the query in context; a reactive block rebuilds `search_results` and `filtered_to_original_map`.
   - `commit_filter` (Toolbar check button) materializes the currently filtered rows into a new `change` event and clears the query.

4. **Row/column structure edits**
   - Menu actions use context helpers (`add_row_at`, `delete_col_at`, etc.) that mutate the `data` array, rebuild headers via `make_headers`, and clear selection state.

5. **Data import/export**
   - Copy uses `copy_table_data` with either the currently selected cells or the whole table.
   - Upload uses `handle_file_upload` (`d3-dsv`) to replace headers/values, which triggers the `values` reactive statement and subsequent resets.

6. **Virtualization & layout**
   - A hidden `<table>` renders a single head/body pair for measuring column widths, while `<VirtualTable>` renders the actual, scrollable body using `search_results`.
   - VirtualTable listens to `items` changes, updates its height map, and emits `scroll_top`. `Table.svelte` also exposes a "scroll to top" button once the user scrolls far enough.

7. **Parent integration**
   - `Index.svelte` forwards `change`, `input`, `select`, `edit`, `fullscreen`, and status events via the Gradio event bus, and toggles `fullscreen` based on child dispatches.

## 4. Observations & Current Risks

- **Multiple mutable sources of truth** — `dataframe_context` keeps references to `data`/`headers`, while `Table.svelte` owns its own `data` variable and frequently deep-clones or reassigns it. Many helpers mutate the same arrays directly, making it difficult to track when a change originates.
- **Manual deep cloning** — Sorting/filter resets rely on `JSON.parse(JSON.stringify(...))`, which is brittle for large datasets and reactive proxies.
- **Side-effect heavy reactive blocks** — Several `$:` statements simultaneously mutate state, update context references, and trigger DOM writes (e.g., recalculating widths). Debugging dependencies is difficult because updates happen implicitly.
- **Search/filter duplication** — The context remembers the query/filter metadata, but the actual filtered dataset (`search_results`) is maintained separately, requiring manual synchronization and index remapping.
- **In-place mutation for data & metadata** — Many utilities mutate arrays rather than returning new ones, which complicates change detection for parent outputs and virtualization caches.
- **Global listeners outside effects** — Document/window listeners are registered imperatively inside `onMount` with manual teardown logic; mixing them with state updates increases the risk of leaks or double-registrations.
- **Data access helpers** — `get_data_at`, `get_row`, `get_column` traverse arrays each time, and selection utilities frequently rebuild ranges; there is no memoized view of columnar data despite repeated access patterns (selection, `select` event payloads, virtualization).

These factors make it hard to enforce a single source of truth, increase the number of reactive dependencies a UI element relies upon, and complicate data access patterns.

## 5. Rune-Centric Architecture Proposal

Leveraging the latest Svelte 5 runes ([`$state`](#references), [`$derived`](#references), [`$effect`](#references), [`$props`](#references), [`$bindable`](#references), [`$inspect`](#references)), we can reshape the dataframe into a predictable state machine with one canonical source of data.

### 5.1 Consolidate canonical state with `$state`

Create a dedicated store (module or context factory) whose shape matches the domain, then expose it via context:

```svelte
<!-- shared/store.ts -->
import { createContext } from 'svelte';

export function createDataframeStore(props) {
	const df = $state({
		data: normalizeData(props.value.data, props.datatype),
		headers: normalizeHeaders(props.value.headers, props.col_count),
		metadata: props.value.metadata ?? null,
		config: buildConfigFromProps(props),
		search: { query: null },
		filter: { columns: [] },
		sort: { columns: [], rowOrder: [] },
		selection: { cells: [], anchor: null, editing: null, header: null },
		menus: { cell: null, header: null, toolbar: null },
		drag: { active: false, start: null },
		layout: { columnWidths: [], pinned: props.pinned_columns ?? 0 },
		status: { copyFlash: false },
		value_is_output: props.value_is_output
	});

	return df;
}
```

- Because `$state` returns deep proxies, mutating `df.data[row][col].value` automatically marks downstream subscribers dirty (see Svelte docs on `$state` deep reactivity). No duplicate arrays or manual `JSON` cloning is needed; snapshots for undo can be `$state.raw` copies.
- Context consumers (cells, headers, toolbar) read slices of the same proxy, so they stay in sync without extra assignments.

### 5.2 Use `$derived` to minimize fan-out

Deriveds become composable selectors: each layer depends on the previous layer only, so UI components subscribe to the smallest possible slice.

```svelte
const filteredRows = $derived(() =>
	applyColumnFilters(df.data, df.filter.columns)
);

const searchedRows = $derived(() =>
	df.search.query ? textFilter(filteredRows, df.search.query) : filteredRows
);

const sortedRows = $derived(() =>
	applySort(searchedRows, df.sort.columns, df.sort.rowOrder)
);

const visibleRows = $derived(() =>
	paginateOrVirtualize(sortedRows, df.layout.viewport)
);
```

- Column/row counts, pinned subsets, row numbers, and static columns can each be exposed as cheap deriveds (`$derived(() => df.headers.slice(0, df.config.pinnedColumns))`).
- Selection helpers (`selectedCell`, `selectedColumnValues`, etc.) can be derived from `df.selection`, eliminating repeated scans.
- Because `$derived` expressions are side-effect free, only components that consume `visibleRows` re-render when filters change; metadata watchers or toolbar buttons do not.

### 5.3 Wrap side effects in `$effect`

Use `$effect` for everything that currently lives in `onMount` or manual watchers:

```svelte
$effect(() => {
	$inspect.trace('resize');

	const observer = new ResizeObserver(entries => {
		for (const entry of entries) {
			df.layout.containerRect = entry.contentRect;
		}
	});
	observer.observe(container);

	return () => observer.disconnect();
});

$effect(() => {
	if (!props.gradio) return;
	const payload = buildPayload(sortedRows, df.headers, df.metadata);
	props.gradio.dispatch('change', payload);
	if (!df.value_is_output) props.gradio.dispatch('input');
});
```

- `$effect` automatically tracks dependencies (`df.layout`, `sortedRows`, etc.), so listeners tear down when the component unmounts or when the relevant node changes.
- `$inspect.trace()` (per the `$inspect` docs) can be dropped into complex effects to see which dependencies caused reruns—valuable during the migration.

### 5.4 Modern prop handling with `$props` & `$bindable`

Handle inputs/outputs via runes instead of manual `export let` plumbing:

```svelte
const { value = $bindable(), gradio, interactive, buttons } = $props();
const df = createDataframeStore({ value, interactive, buttons, ... });
```

- Using `$bindable` for `value` makes the dataframe directly bindable from the parent (still optional). Internally we keep mutating `df.data`, but emitting changes becomes a single `$effect` watching `value`.
- Derive `config` flags directly from destructured props instead of passing ~20 separate exports down into the context.

### 5.5 Command-style actions instead of multi file mutations

Encapsulate user intents as idempotent functions that operate only on the `$state` tree and accept plain payloads. Example:

```ts
function selectCell(coord: CellCoordinate, opts = { extend: false }) {
	if (opts.extend && df.selection.anchor) {
		df.selection.cells = getRange(df.selection.anchor, coord);
	} else {
		df.selection.anchor = coord;
		df.selection.cells = [coord];
	}
	df.selection.editing = df.config.editable && df.selection.cells.length === 1
		? coord
		: null;
}
```

- DOM event handlers become thin wrappers that translate native events into command payloads. This makes it easier to unit-test logic away from DOM components and reduces the need for `context.actions` objects.
- Each command updates a single `$state` tree, so debugging is simply inspecting `df` in devtools.

### 5.6 Simplify data access with memoized maps

Use `$derived` selectors to expose common lookups:

```ts
const cellMap = $derived(() => new Map(
	df.data.flatMap((row, r) => row.map((cell, c) => [cell.id, { cell, r, c }]))
));

const columns = $derived(() => transpose(visibleRows));
```

- Selection handlers, menu payloads, and external `select` events can read from `cellMap` or `columns` in O(1), removing repeated traversals and reducing the risk of stale references.
- The transpose can be computed lazily with `$derived.by` to avoid rebuilding the entire matrix unless `visibleRows` actually changes.

### 5.7 Virtualization as a derived view model

Instead of a separate Svelte component with its own mutable fields, model virtualization math as derived state + effects:

```ts
const viewportModel = $derived.by(() => {
	return computeViewport({
		rows: visibleRows,
		rowHeight: df.layout.rowHeight,
		scrollTop: df.layout.scrollTop,
		maxHeight: df.config.max_height
	});
});

$effect(() => {
	virtualList.style.setProperty('--table-height', `${viewportModel.height}px`);
});
```

- The rendering component (`<VirtualBody>` or similar) receives `viewportModel.visibleRows` and paints them; scroll handlers merely update `df.layout.scrollTop`.
- Because virtualization data is derived from the same canonical rows, there is zero drift between what the body renders and what selection logic expects.

### 5.8 Class-based store sketch

Instead of juggling external stores or sprinkling runes throughout components, we can model the dataframe as a Svelte class whose fields are reactive. This follows the “state class” pattern described in [joyofcode’s article](https://joyofcode.xyz/how-to-share-state-in-svelte-5#using-classes-for-reactive-state). Each instance is provided via context, and consumers read either the base state fields or the derived projections.

```ts
// shared/state/DataframeStore.ts
import type { CellCoordinate, CellValue } from "../types";

export class DataframeStore {
  // --- base state (mutable) ---
  data = $state<CellValue[][]>([]);
  headers = $state<string[]>([]);
  metadata = $state<Record<string, any> | null>(null);

  search = $state({ query: null as string | null });
  filter = $state({ columns: [] as FilterColumn[] });
  sort = $state({ columns: [] as SortColumn[] });
  layout = $state({
    viewport: { height: 0, scrollTop: 0 },
    pinnedColumns: 0,
    columnWidths: [] as number[]
  });
  selection = $state({
    cells: [] as CellCoordinate[],
    anchor: null as CellCoordinate | null,
    editing: null as CellCoordinate | null,
    header: null as number | null
  });

  constructor(initial: InitProps) {
    this.data = normalizeData(initial.value.data, initial.datatype);
    this.headers = normalizeHeaders(initial.value.headers, initial.col_count);
    this.metadata = initial.value.metadata ?? null;
    this.layout.pinnedColumns = initial.pinned_columns ?? 0;
    this.layout.columnWidths = initial.column_widths ?? [];
  }

  // --- derived projections (read-only) ---
  filteredRows = $derived.by(() =>
    applyFilters(this.data, this.filter.columns)
  );
  searchedRows = $derived.by(() =>
    this.search.query
      ? applySearch(this.filteredRows, this.search.query)
      : this.filteredRows
  );
  sortedRows = $derived.by(() =>
    applySort(this.searchedRows, this.sort.columns)
  );
  visibleRows = $derived.by(() =>
    virtualize(this.sortedRows, this.layout.viewport)
  );
  selectedCell = $derived(
    this.selection.cells.length ? this.selection.cells[0] : null
  );
  columns = $derived.by(() => transpose(this.visibleRows));

  // --- commands (mutate base state only) ---
  selectCell(coord: CellCoordinate, opts?: { extend?: boolean }) { /* ... */ }
  updateCell(coord: CellCoordinate, value: CellValue) { /* ... */ }
  setSearch(query: string | null) { this.search.query = query; }
  toggleFilter(filter: FilterColumn) { /* ... */ }
  setSort(columns: SortColumn[]) { this.sort.columns = columns; }
  setViewport(next: { height: number; scrollTop: number }) {
    this.layout.viewport = next;
  }
}
```

Key points:

- **Separation of concerns**: mutable `$state` fields hold the raw truth (`data`, `filter`, `selection`), while `$derived` fields expose read-only projections like `visibleRows` or `columns`.
- **Single flow**: any command—cell edit, filter toggle, search input—mutates only base fields. Because derived fields depend on those bases, the entire transform pipeline reflows automatically with no duplicate arrays.
- **Context usage**: `const df = getContext(DataframeKey) as DataframeStore;` gives components access to both commands and derived state. There’s no need for external Svelte stores or custom `actions` objects.
- **Testing**: commands can be unit-tested by instantiating the class and asserting on derived properties, keeping view components slim.

### 5.9 Migration sketch

1. **Encapsulate state** — replace `dataframe_context` with the `DataframeStore` class; instantiate it in `Table.svelte` and provide via context.
2. **Derive projections** — phase out ad-hoc `search_results`/`filtered_to_original_map` in favor of layered derived selectors.
3. **Refactor components** — update `Table.svelte` (and children) to consume derived selectors + new command functions. Remove direct mutations of `data` arrays.
4. **Move side effects into `$effect`** — convert `onMount` setup/teardown plus manual watchers into effects; leverage `$inspect.trace` for debugging.
5. **Tidy props/outputs** — switch to `$props`/`$bindable` for `value`, and use a single `$effect` to emit downstream Gradio events based on the canonical state.
6. **Gradually retire utility clones** — once state is proxied, replace JSON cloning with `$state.raw` snapshots or immutable helper utilities where necessary.

## References to Svelte runes

- [`$state` documentation](referenced via MCP) — deep reactivity & `raw` snapshots enable the single source-of-truth state tree.
- [`$derived` documentation](referenced via MCP) — dependency-tracked selectors reduce reactive fan-out and allow temporary overrides (optimistic UI).
- [`$effect` documentation](referenced via MCP) — lifecycle-safe side effects replace manual `onMount` bookkeeping.
- [`$props` and `$bindable` documentation](referenced via MCP) — clean prop handling and optional bidirectional binding for the dataframe value.
- [`$inspect` documentation](referenced via MCP) — use `.trace` during migration to understand why an effect re-ran.

Adopting these runes will align the dataframe package with the latest Svelte 5 patterns, give every UI element a consistent view of the data, and sharply reduce the amount of bespoke reactive bookkeeping currently required.

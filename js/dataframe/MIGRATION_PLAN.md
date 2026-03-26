# Dataframe Migration: TanStack Table + Virtual with Svelte 5

## Context

The Gradio Dataframe component currently uses an egregious hack: the Svelte 5 `Index.svelte` mounts a compiled Svelte 4 component (`@gradio/dataframe-interim`) wrapping a stale npm package (`@gradio/dataframe-npm@0.20.1`). Meanwhile, a full Svelte 5 rewrite exists in `js/dataframe/shared/` but uses Svelte 4 syntax and implements all table/virtualization logic from scratch (~3700 lines of custom code).

This migration replaces the custom virtual table implementation with TanStack Table + TanStack Virtual, migrates all components to Svelte 5 runes, and removes the interim hack. The goal is to reduce maintenance burden by delegating sorting, filtering, column management, and virtualization to battle-tested libraries.

---

## Key Decision: Use Core Packages with Custom Adapters

`@tanstack/svelte-table` (v8) and `@tanstack/svelte-virtual` (v3) do NOT work with Svelte 5 -- they import from the deprecated `svelte/internal`. The official v9 alpha exists but is unstable.

**Our approach:** Use `@tanstack/table-core` and `@tanstack/virtual-core` directly with thin custom Svelte 5 adapters (~100 lines each). This is the pattern used by every successful Svelte 5 + TanStack integration in production. The adapters are trivial wrappers that bridge the core library's state with Svelte 5's `$state` runes.

---

## Phase 0: Prerequisites

### Package Changes (`js/dataframe/package.json`)

**Add to dependencies:**
- `@tanstack/table-core` (latest stable ~8.x)
- `@tanstack/virtual-core` (latest stable ~3.x)

**Remove from devDependencies:**
- `@gradio/dataframe-interim`

### New Files: `js/dataframe/shared/tanstack/`

**`table.svelte.ts`** (~60 lines) -- Svelte 5 adapter for TanStack Table
- Exports `createSvelteTable(options)`
- Uses `$state` proxy over `createTable()` from `@tanstack/table-core`
- Wraps the table instance in a reactive proxy that triggers Svelte re-renders on state changes
- Pattern: create core table -> wrap in `$state` -> return proxy that intercepts `getState()` and `getRowModel()` calls

**`virtual.svelte.ts`** (~80 lines) -- Svelte 5 adapter for TanStack Virtual
- Exports `createSvelteVirtualizer(options)`
- Uses `$state` + `$effect` for lifecycle (`_didMount`, `_willUpdate`)
- Wraps `Virtualizer` from `@tanstack/virtual-core`
- Returns reactive proxy for `getVirtualItems()` and `getTotalSize()`

**`flex-render.svelte`** (~40 lines) -- Dynamic cell/header renderer
- Renders TanStack column def content (string, component, or function)
- Uses `renderComponent()` helper for Svelte component rendering in column defs

**`render-component.ts`** (~20 lines) -- Utility for wrapping Svelte components in column definitions

---

## Phase 1: State Management Redesign

### Replace `context/dataframe_context.ts` -> `context/dataframe_context.svelte.ts`

Current: 702 lines using Svelte stores (`writable`, `get`), managing sort/filter/UI state in one monolithic store.

New: TanStack owns sort/filter/pinning state. Gradio context owns only UI state (selection, editing, menus).

**New row type for TanStack:**
```typescript
interface GradioRow {
  _rowIndex: number;          // Original row index for Python event dispatch
  _cells: TableCell[];        // Raw cell array with IDs
  [columnId: string]: CellValue; // Accessor values
}
```

**TanStack table creation (in Table.svelte):**
```typescript
let sorting = $state<SortingState>([]);
let columnFilters = $state<ColumnFiltersState>([]);
let globalFilter = $state<string>('');
let columnPinning = $state<ColumnPinningState>({ left: [...pinnedColIds] });

const table = createSvelteTable({
  get data() { return rowData; },
  columns: columnDefs,
  state: {
    get sorting() { return sorting; },
    get columnFilters() { return columnFilters; },
    get globalFilter() { return globalFilter; },
    get columnPinning() { return columnPinning; },
  },
  onSortingChange: updater => { sorting = typeof updater === 'function' ? updater(sorting) : updater; },
  onColumnFiltersChange: updater => { columnFilters = typeof updater === 'function' ? updater(columnFilters) : updater; },
  onGlobalFilterChange: updater => { globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater; },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  globalFilterFn: 'includesString',
});
```

**UI state ($state instead of writable store):**
```typescript
let ui = $state<GradioUIState>({
  selected_cells: [],
  selected: false,
  editing: false,
  header_edit: false,
  selected_header: false,
  active_cell_menu: null,
  active_header_menu: null,
  active_button: null,
  copy_flash: false,
});
```

**Key benefit:** TanStack never mutates the source data. Sort/filter produce derived row models. This eliminates the fragile `initial_data` snapshot pattern and in-place array splicing currently in `sort_table_data()` and `filter_data_and_preserve_selection()`.

**Custom filter function for Gradio's filter model:**
TanStack column filters accept custom `filterFn` on each column. We implement the existing filter operators (Contains, Starts with, Is, >, <, etc.) as a single `gradioFilterFn` that reads `{ datatype, filter, value }` from the column filter state.

---

## Phase 2: Leaf Component Migration (Svelte 5 Runes)

All components in `shared/` need Svelte 5 syntax. Migrate bottom-up to avoid cascading breakage.

### Svelte 5 transformation rules applied to all files:
| Svelte 4 | Svelte 5 |
|---|---|
| `export let prop` | `let { prop } = $props()` |
| `$: x = expr` | `let x = $derived(expr)` |
| `$: { sideEffect }` | `$effect(() => { sideEffect })` |
| `createEventDispatcher` + `dispatch('name')` | Callback prop `onname?.(data)` |
| `on:click={fn}` | `onclick={fn}` |
| `on:click\|stopPropagation` | `onclick={(e) => { e.stopPropagation(); fn(e) }}` |
| `<slot name="x">` | `{#snippet x()}{/snippet}` + `{@render x()}` |
| `<slot let:item>` | `{#snippet children(item)}{/snippet}` |
| `afterUpdate(fn)` | `$effect(fn)` |
| `onDestroy(fn)` | `$effect(() => { return fn })` |
| `$store` subscription | Direct `$state` object access |

### Migration order:
1. `RowNumber.svelte` -- trivial, no events
2. `EmptyRowButton.svelte` -- trivial, one callback
3. `CellMenuButton.svelte` -- one click handler
4. `CellMenuIcons.svelte` -- pure SVG, no events
5. All icon components (`Padlock`, `SortArrow*`, `SortButton*`, `SortIcon`, `FilterIcon`, `SelectionButtons`)
6. `BooleanCell.svelte` -- checkbox, one onchange callback
7. `EditableCell.svelte` -- textarea editing, `dispatch('blur')` -> `onblur` callback
8. `FilterMenu.svelte` -- filter config UI
9. `CellMenu.svelte` -- context menu, wire sort/filter callbacks
10. `Toolbar.svelte` -- search/copy/fullscreen, `dispatch('search')` -> `onsearch` callback

---

## Phase 3: Core Table Rewrite

### `Table.svelte` -- Major rewrite

This is the critical file. Currently ~1100 lines. Target ~600-700 lines.

**Key structural changes:**

1. **Remove the hidden measurement table** (lines 861-930). The current approach renders an invisible `<table>` to measure column widths via `get_max()`. Instead, use TanStack column sizing (`column.getSize()`) and CSS `min-width`/`max-width` on cells. Column widths from the Python prop (`column_widths`) are set via `columnDef.size`.

2. **Replace `VirtualTable` + slots with inline virtual rendering:**
```svelte
<div bind:this={scrollContainer} class="scroll-container" style="max-height: {max_height}px; overflow: auto;">
  <table style="height: {virtualizer.getTotalSize()}px; width: 100%;">
    <thead class="sticky-header">
      <tr>
        {#if show_row_numbers}<RowNumber is_header />{/if}
        {#each table.getHeaderGroups()[0].headers as header (header.id)}
          <TableHeader {header} ... />
        {/each}
      </tr>
    </thead>
    <tbody style="position: relative;">
      {#each virtualizer.getVirtualItems() as virtualRow (virtualRow.key)}
        {@const row = rows[virtualRow.index]}
        <tr
          data-index={virtualRow.index}
          class:row-odd={virtualRow.index % 2 === 0}
          style="position: absolute; top: 0; left: 0; width: 100%; height: auto; transform: translateY({virtualRow.start}px);"
        >
          {#if show_row_numbers}<RowNumber index={virtualRow.index} />{/if}
          {#each row.getVisibleCells() as cell (cell.id)}
            <TableCell {cell} ... />
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
```

3. **Replace manual sort/filter mutation** with TanStack declarative state. When user clicks sort: `sorting = [{ id: colId, desc: direction === 'desc' }]`. TanStack automatically produces the sorted row model. No more `sort_table_data()`, `filter_data_and_preserve_selection()`, or `initial_data` snapshots.

4. **Global search** becomes TanStack's `globalFilter` state. The current `search_results` parallel array is eliminated. When `show_search === "filter"`, committing the filter copies the filtered rows back as new data to the Python backend.

5. **Column pinning** uses TanStack's `columnPinning` state. The `table.getLeftHeaderGroups()` and `row.getLeftVisibleCells()` APIs provide pinned columns. CSS sticky positioning stays the same.

6. **Row/column CRUD** (dynamic add/delete): Since TanStack doesn't mutate the source data, we modify the `data` state array directly. Adding a row: `data = [...data, newRow]`. Deleting: `data = data.filter(...)`. TanStack picks up the change reactively.

7. **Event dispatch**: Replace `createEventDispatcher` with callback props:
   - `onchange?: (value: DataframeValue) => void`
   - `oninput?: () => void`
   - `onselect?: (data: SelectData) => void`
   - `onedit?: (data: EditData) => void`

### `TableHeader.svelte` -- Receive TanStack Header object

Instead of receiving raw values + indices + callbacks, receive the TanStack `Header` object:
```typescript
let { header, datatype, editable, is_static, i18n, ... } = $props();
// Width: header.getSize()
// Pinned: header.column.getIsPinned()
// Sort: header.column.getIsSorted() returns 'asc' | 'desc' | false
// Sort priority: from sorting state array index
```

### `TableCell.svelte` -- Receive TanStack Cell object

Receive `Cell` object + Gradio-specific props (selection, editing, styling):
```typescript
let { cell, selected_cells, editing, copy_flash, styling, ... } = $props();
// Value: cell.getValue()
// Column index: cell.column.columnDef.meta.colIndex
// Row index: cell.row.original._rowIndex
// Width: cell.column.getSize()
// Pinned: cell.column.getIsPinned()
```

**Preserve:** `data-row` and `data-col` attributes using `cell.row.original._rowIndex` and `cell.column.columnDef.meta.colIndex`.

### DELETE `VirtualTable.svelte`

All 380 lines replaced by ~30 lines of TanStack Virtual integration in Table.svelte. The CSS (scrollbar styling, sticky thead, pinned column styles) moves into Table.svelte's `<style>` block.

---

## Phase 4: Entry Point + Cleanup

### `Index.svelte` -- Complete rewrite

Remove the interim Svelte 4 hack entirely. The new Index.svelte directly renders `Table.svelte`:

```svelte
<script lang="ts">
  import Table from "./shared/Table.svelte";
  // Standard Gradio component wrapper pattern
  let { value, col_count, row_count, datatype, ... } = $props();
</script>

<Table
  headers={value?.headers}
  values={value?.data}
  display_value={value?.metadata?.display_value}
  styling={value?.metadata?.styling}
  {col_count} {row_count} {datatype} ...
  onchange={handleChange}
  onselect={handleSelect}
  ...
/>
```

### `standalone/Index.svelte` -- Svelte 5 migration
Same pattern as above, just wrapping Table.svelte for npm distribution.

### Delete `js/dataframe-interim/` entirely
Remove the entire package directory. Update workspace config if needed.

---

## Phase 5: Utility Cleanup

### DELETE (replaced by TanStack):
- `utils/sort_utils.ts` -- sorting now via `getSortedRowModel()`
- `utils/filter_utils.ts` -- filtering now via `getFilteredRowModel()` + custom `filterFn`

### SIMPLIFY:
- `utils/table_utils.ts` -- remove `sort_table_data()`, `filter_table_data()`, `get_max()`. Keep `copy_table_data()`, `handle_file_upload()`, `guess_delimiter()`.
- `utils/data_processing.ts` -- simplify `process_data()` to produce `GradioRow[]` for TanStack. Keep `make_headers()` adapted to produce `ColumnDef[]`.

### KEEP (update types/imports only):
- `utils/selection_utils.ts` -- cell-level selection is custom (TanStack only does row selection)
- `utils/keyboard_utils.ts` -- arrow/tab/enter navigation with editing integration
- `utils/drag_utils.ts` -- mouse drag range selection
- `utils/menu_utils.ts` -- menu positioning calculations

### RENAME:
- `context/dataframe_context.ts` -> `context/dataframe_context.svelte.ts` (for `$state` rune support in `.ts` files)

---

## Phase 6: Testing

### Unit Tests (Vitest, `pnpm test:run`)

**New tests:**
- `tanstack/table.svelte.test.ts` -- verify reactive table creation, sorting state changes propagate
- `tanstack/virtual.svelte.test.ts` -- verify virtualizer creation and item calculation
- `context/dataframe_context.svelte.test.ts` -- UI state management, action dispatch

**Update:**
- `test/sort_utils.test.ts` -- repurpose to test TanStack sorting integration or delete (TanStack owns sorting correctness)
- `test/table_utils.test.ts` -- update imports, remove tests for deleted functions, keep `copy_table_data`, `process_data`, `make_headers`, `cast_value_to_type` tests

**Un-skip:**
- `Dataframe.test.ts` -- update to work with new Svelte 5 component API

### E2E Tests (Playwright, `pnpm test:browser:full`)

Existing tests in `js/spa/test/dataframe_*.spec.ts` must pass without modification. Key selectors to preserve:
- `[data-row='N'][data-col='N']` -- cell identification
- `getByLabel("Edit cell")` -- textarea in editing mode
- `getByPlaceholder("Filter...")` / `getByPlaceholder("Search...")`
- `getByRole("button", { name: "..." })` -- toolbar buttons

### Manual Testing Checklist
1. Render with headers + data (str, number, bool, markdown, html, image types)
2. Sort: single column asc/desc, multi-column with priorities, clear sort
3. Filter: string filters (contains, starts with, is), number filters (>, <, =), clear filter
4. Search: global search, filter-mode commit
5. Selection: click, shift+click range, ctrl/cmd+click multi, drag range
6. Editing: click to edit, type text, enter to commit, escape to cancel, tab to next cell
7. Boolean: checkbox toggle
8. Keyboard: arrows, tab/shift+tab, ctrl+arrows (jump to edge), enter/escape
9. Column pinning: sticky left columns during horizontal scroll
10. Row numbers: toggle visibility, correct 1-indexed display
11. Context menu: add/delete row above/below, add/delete column left/right
12. Copy: ctrl+C copies selected cells
13. CSV upload: drag-and-drop file import
14. Fullscreen: toggle mode
15. Large dataset: 1000+ rows smooth scrolling, no jank
16. Dynamic row/col: add rows when empty, add columns
17. Static columns: non-editable, padlock icon
18. Display values + styling: metadata from Python renders correctly

---

## Files Summary

### New Files
| File | Purpose |
|---|---|
| `shared/tanstack/table.svelte.ts` | Svelte 5 adapter for @tanstack/table-core |
| `shared/tanstack/virtual.svelte.ts` | Svelte 5 adapter for @tanstack/virtual-core |
| `shared/tanstack/flex-render.svelte` | Dynamic cell/header content renderer |
| `shared/tanstack/render-component.ts` | Component rendering utility |
| `shared/context/dataframe_context.svelte.ts` | New state management with runes + TanStack |

### Modified Files (Svelte 5 + TanStack integration)
| File | Change Scope |
|---|---|
| `package.json` | Add tanstack deps, remove interim dep |
| `Index.svelte` | Complete rewrite (remove interim hack) |
| `shared/Table.svelte` | Major rewrite (TanStack integration) |
| `shared/TableHeader.svelte` | Moderate (receive TanStack Header, Svelte 5) |
| `shared/TableCell.svelte` | Moderate (receive TanStack Cell, Svelte 5) |
| `shared/EditableCell.svelte` | Moderate (Svelte 5 runes) |
| `shared/BooleanCell.svelte` | Minor (Svelte 5 runes) |
| `shared/CellMenu.svelte` | Moderate (Svelte 5, TanStack sort/filter) |
| `shared/FilterMenu.svelte` | Moderate (Svelte 5 runes) |
| `shared/Toolbar.svelte` | Moderate (Svelte 5, globalFilter) |
| `shared/RowNumber.svelte` | Minor (Svelte 5 runes) |
| `shared/EmptyRowButton.svelte` | Minor (Svelte 5 runes) |
| `shared/CellMenuButton.svelte` | Minor (Svelte 5 runes) |
| `shared/CellMenuIcons.svelte` | Minor (Svelte 5 runes) |
| `shared/icons/*.svelte` | Minor (Svelte 5 runes) |
| `standalone/Index.svelte` | Moderate (Svelte 5 runes) |
| `shared/utils/table_utils.ts` | Remove sort/filter fns, keep copy/upload |
| `shared/utils/data_processing.ts` | Adapt for GradioRow + ColumnDef generation |
| `shared/utils/keyboard_utils.ts` | Update context type imports |
| `shared/utils/selection_utils.ts` | Update context type imports |
| `shared/utils/drag_utils.ts` | Update context type imports |
| `shared/utils/menu_utils.ts` | Update context type imports |
| `shared/types.ts` | Add GradioRow, update exports |

### Deleted Files
| File | Reason |
|---|---|
| `shared/VirtualTable.svelte` | Replaced by TanStack Virtual |
| `shared/utils/sort_utils.ts` | Replaced by TanStack Table sorting |
| `shared/utils/filter_utils.ts` | Replaced by TanStack Table filtering |
| `shared/context/dataframe_context.ts` | Replaced by new .svelte.ts version |
| `js/dataframe-interim/` (entire directory) | Svelte 4 hack no longer needed |

### Test Files
| File | Action |
|---|---|
| `Dataframe.test.ts` | Un-skip, update for new API |
| `test/sort_utils.test.ts` | Delete or repurpose |
| `test/table_utils.test.ts` | Update imports, remove deleted fn tests |
| `shared/tanstack/*.test.ts` (new) | Adapter unit tests |
| `js/spa/test/dataframe_*.spec.ts` | Must pass unchanged |

---

## Verification

1. `pnpm install` -- dependencies resolve
2. `pnpm ts:check` -- no TypeScript errors
3. `pnpm lint` -- no ESLint errors
4. `pnpm test:run` -- unit tests pass (run from repo root)
5. `pnpm test:browser:full` -- Playwright E2E tests pass
6. Manual: run `demo/dataframe_colorful/run.py` and test all 18 features above
7. Manual: test with 10,000+ row dataset for virtualization performance

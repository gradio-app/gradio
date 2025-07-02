<script lang="ts">
	import { Copy, Check } from "@gradio/icons";
	import { FullscreenButton } from "@gradio/atoms";
	import { onDestroy } from "svelte";
	import { createEventDispatcher } from "svelte";

	export let show_fullscreen_button = false;
	export let show_copy_button = false;
	export let show_search: "none" | "search" | "filter" = "none";
	export let fullscreen = false;
	export let on_copy: () => Promise<void>;
	export let on_commit_filter: () => void;

	const dispatch = createEventDispatcher<{
		search: string | null;
	}>();

	let copied = false;
	let timer: ReturnType<typeof setTimeout>;
	export let current_search_query: string | null = null;
	let input_value = "";

	function handle_search_input(e: Event): void {
		const target = e.target as HTMLTextAreaElement;
		input_value = target.value;
		const new_query = input_value || null;
		if (current_search_query !== new_query) {
			current_search_query = new_query;
			dispatch("search", current_search_query);
		}
	}

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	async function handle_copy(): Promise<void> {
		await on_copy();
		copy_feedback();
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<div class="toolbar" role="toolbar" aria-label="Table actions">
	<div class="toolbar-buttons">
		{#if show_search !== "none"}
			<div class="search-container">
				<input
					type="text"
					value={current_search_query || ""}
					on:input={handle_search_input}
					placeholder={show_search === "filter" ? "Filter..." : "Search..."}
					class="search-input"
					class:filter-mode={show_search === "filter"}
					title={`Enter text to ${show_search} the table`}
				/>
				{#if current_search_query && show_search === "filter"}
					<button
						class="toolbar-button check-button"
						on:click={on_commit_filter}
						aria-label="Apply filter and update dataframe values"
						title="Apply filter and update dataframe values"
					>
						<Check />
					</button>
				{/if}
			</div>
		{/if}
		{#if show_copy_button}
			<button
				class="toolbar-button"
				on:click={handle_copy}
				aria-label={copied ? "Copied to clipboard" : "Copy table data"}
				title={copied ? "Copied to clipboard" : "Copy table data"}
			>
				{#if copied}
					<Check />
				{:else}
					<Copy />
				{/if}
			</button>
		{/if}
		{#if show_fullscreen_button}
			<FullscreenButton {fullscreen} on:fullscreen />
		{/if}
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		flex: 0 0 auto;
	}

	.toolbar-buttons {
		display: flex;
		gap: var(--size-1);
		flex-wrap: nowrap;
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-6);
		height: var(--size-6);
		padding: var(--size-1);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--body-text-color-subdued);
		cursor: pointer;
		transition: all 0.2s;
	}

	.toolbar-button:hover {
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
	}

	.toolbar-button :global(svg) {
		width: var(--size-4);
		height: var(--size-4);
	}

	.search-container {
		position: relative;
	}

	.search-input {
		width: var(--size-full);
		height: var(--size-6);
		padding: var(--size-2);
		padding-right: var(--size-8);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--table-radius);
		font-size: var(--text-sm);
		color: var(--body-text-color);
		background: var(--background-fill-secondary);
		transition: all 0.2s ease;
	}

	.search-input:hover {
		border-color: var(--border-color-secondary);
		background: var(--background-fill-primary);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent);
		background: var(--background-fill-primary);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.check-button {
		position: absolute;
		right: var(--size-1);
		top: 50%;
		transform: translateY(-50%);
		background: var(--color-accent);
		color: white;
		border: none;
		width: var(--size-4);
		height: var(--size-4);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--size-1);
	}

	.check-button :global(svg) {
		width: var(--size-3);
		height: var(--size-3);
	}

	.check-button:hover {
		background: var(--color-accent-soft);
	}
</style>

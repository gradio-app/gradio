<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	const dispatch = createEventDispatcher<{
		expand: void;
		collapse: void;
	}>();

	export let open = true;
	export let width: number | string;

	// Using a temporary variable to animate the sidebar opening at the start
	let _open = false;
	let sidebar_div: HTMLElement;
	let overlap_amount = 0;

	let width_css = typeof width === "number" ? `${width}px` : width;

	// Check if the sidebar overlaps with the main content
	function check_overlap(): void {
		if (!sidebar_div?.parentElement) return;
		const parent_rect = sidebar_div.parentElement.getBoundingClientRect();
		const sidebar_rect = sidebar_div.getBoundingClientRect();
		const available_space = parent_rect.left;
		overlap_amount = Math.max(0, sidebar_rect.width - available_space + 30);
	}

	onMount(() => {
		sidebar_div.parentElement?.classList.add("sidebar-parent");
		check_overlap();
		window.addEventListener("resize", check_overlap);

		const update_parent_overlap = (): void => {
			if (sidebar_div?.parentElement) {
				sidebar_div.parentElement.style.setProperty(
					"--overlap-amount",
					`${overlap_amount}px`
				);
			}
		};
		update_parent_overlap();
		_open = open;
		return () => window.removeEventListener("resize", check_overlap);
	});
</script>

<div
	class="sidebar"
	class:open={_open}
	bind:this={sidebar_div}
	style="width: {width_css}; left: calc({width_css} * -1)"
>
	<button
		on:click={() => {
			_open = !_open;
			if (_open) {
				dispatch("expand");
			} else {
				dispatch("collapse");
			}
		}}
		class="toggle-button"
		aria-label="Toggle Sidebar"
	>
		<div class="chevron">
			<span class="chevron-left"></span>
		</div>
	</button>
	<div class="sidebar-content">
		<slot />
	</div>
</div>

<style>
	:global(.sidebar-parent) {
		display: flex !important;
		padding-left: 0;
		transition: padding-left 0.3s ease-in-out;
	}

	:global(.sidebar-parent:has(.sidebar.open)) {
		padding-left: var(--overlap-amount);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		height: 100%;
		background-color: var(--background-fill-secondary);
		box-shadow: var(--size-1) 0 var(--size-2) rgba(100, 89, 89, 0.1);
		transform: translateX(0%);
		transition: transform 0.3s ease-in-out;
		z-index: 1000;
	}

	.sidebar.open {
		transform: translateX(100%);
	}

	.toggle-button {
		position: absolute;
		top: var(--size-4);
		right: calc(var(--size-8) * -1);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--size-2);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: right 0.3s ease-in-out;
		width: var(--size-8);
		height: var(--size-8);
		z-index: 1001;
	}

	.open .toggle-button {
		right: var(--size-2-5);
		transform: rotate(180deg);
	}

	.chevron {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chevron-left {
		position: relative;
		width: var(--size-3);
		height: var(--size-3);
		border-top: var(--size-0-5) solid var(--button-secondary-text-color);
		border-right: var(--size-0-5) solid var(--button-secondary-text-color);
		transform: rotate(45deg);
	}

	.sidebar-content {
		padding: var(--size-5);
		overflow-y: auto;
	}
</style>

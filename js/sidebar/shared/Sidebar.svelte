<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	const dispatch = createEventDispatcher<{
		expand: void;
		collapse: void;
	}>();

	export let open = true;
	export let width: number | string;
	export let position: "left" | "right" = "left";

	// Using a temporary variable to animate the sidebar opening at the start
	let mounted = false;
	let _open = false;
	let sidebar_div: HTMLElement;
	let overlap_amount = 0;

	let width_css = typeof width === "number" ? `${width}px` : width;
	let prefersReducedMotion: boolean;

	// Check if the sidebar overlaps with the main content
	function check_overlap(): void {
		if (!sidebar_div.closest(".wrap")) return;
		const parent_rect = sidebar_div.closest(".wrap")?.getBoundingClientRect();
		if (!parent_rect) return;
		const sidebar_rect = sidebar_div.getBoundingClientRect();
		const available_space =
			position === "left"
				? parent_rect.left
				: window.innerWidth - parent_rect.right;
		overlap_amount = Math.max(0, sidebar_rect.width - available_space + 30);
	}

	onMount(() => {
		sidebar_div.closest(".wrap")?.classList.add("sidebar-parent");
		check_overlap();
		window.addEventListener("resize", check_overlap);
		const update_parent_overlap = (): void => {
			document.documentElement.style.setProperty(
				"--overlap-amount",
				`${overlap_amount}px`
			);
		};
		update_parent_overlap();
		mounted = true;
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		prefersReducedMotion = mediaQuery.matches;
		const updateMotionPreference = (e: MediaQueryListEvent): void => {
			prefersReducedMotion = e.matches;
		};
		mediaQuery.addEventListener("change", updateMotionPreference);
		return () => {
			window.removeEventListener("resize", check_overlap);
			mediaQuery.removeEventListener("change", updateMotionPreference);
		};
	});

	// We need to wait for the component to be mounted before we can set the open state
	// so that it animates correctly.
	$: if (mounted) _open = open;
</script>

<div
	class="sidebar"
	class:open={_open}
	class:right={position === "right"}
	class:reduce-motion={prefersReducedMotion}
	bind:this={sidebar_div}
	style="width: {width_css}; {position}: calc({width_css} * -1)"
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
	/* Mobile styles (≤ 768px) */
	@media (max-width: 768px) {
		.sidebar {
			width: 100vw !important;
		}

		.sidebar:not(.right) {
			left: -100vw !important;
		}

		.sidebar.right {
			right: -100vw !important;
		}

		.sidebar:not(.reduce-motion) {
			transition: transform 0.3s ease-in-out !important;
		}

		:global(.sidebar-parent) {
			padding-left: 0 !important;
			padding-right: 0 !important;
		}

		:global(.sidebar-parent:has(.sidebar.open)) {
			padding-left: 0 !important;
			padding-right: 0 !important;
		}
		.sidebar.open {
			z-index: 1001 !important;
		}
	}

	:global(.sidebar-parent) {
		display: flex !important;
		padding-left: 0;
		padding-right: 0;
	}

	:global(.sidebar-parent:not(.reduce-motion)) {
		transition:
			padding-left 0.3s ease-in-out,
			padding-right 0.3s ease-in-out;
	}

	:global(.sidebar-parent:has(.sidebar.open:not(.right))) {
		padding-left: var(--overlap-amount);
	}

	:global(.sidebar-parent:has(.sidebar.open.right)) {
		padding-right: var(--overlap-amount);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		height: 100%;
		background-color: var(--background-fill-secondary);
		transform: translateX(0%);
		z-index: 1000;
	}

	.sidebar:not(.reduce-motion) {
		transition: transform 0.3s ease-in-out;
	}

	.sidebar.open:not(.right) {
		transform: translateX(100%);
		box-shadow: var(--size-1) 0 var(--size-2) rgba(100, 89, 89, 0.1);
	}

	.sidebar.open.right {
		transform: translateX(-100%);
		box-shadow: calc(var(--size-1) * -1) 0 var(--size-2) rgba(100, 89, 89, 0.1);
	}

	.toggle-button {
		position: absolute;
		top: var(--size-4);
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--size-2);
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-8);
		height: var(--size-8);
		z-index: 1001;
	}

	.toggle-button:not(.reduce-motion) {
		transition: all 0.3s ease-in-out;
	}

	.sidebar:not(.right) .toggle-button {
		right: calc(var(--size-8) * -1);
	}

	.sidebar.right .toggle-button {
		left: calc(var(--size-8) * -1);
		transform: rotate(180deg);
	}

	.open:not(.right) .toggle-button {
		right: var(--size-2-5);
		transform: rotate(180deg);
	}

	.open.right .toggle-button {
		left: auto;
		right: var(--size-2-5);
		transform: rotate(0deg);
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
		padding-right: var(--size-8);
		overflow-y: auto;
	}

	.sidebar.right .sidebar-content {
		padding-left: var(--size-8);
	}
</style>

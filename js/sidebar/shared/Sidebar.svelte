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

	let width_css = typeof width === "number" ? `${width}px` : width;

	let prefersReducedMotion: boolean;

	function check_overlap(): void {
		if (!sidebar_div.closest(".gradio-container")) return;
		const parent_container = sidebar_div.closest(
			".gradio-container"
		) as HTMLElement;
		const parent_rect = parent_container?.getBoundingClientRect();
		if (!parent_rect) return;

		const parentHeight = parent_rect.height;
		sidebar_div.style.height = `${parentHeight}px`;

		let positioned_parent = sidebar_div.parentElement;
		while (
			positioned_parent &&
			positioned_parent !== parent_container &&
			getComputedStyle(positioned_parent).position === "static"
		) {
			positioned_parent = positioned_parent.parentElement;
		}

		const positioned_parent_rect = positioned_parent?.getBoundingClientRect();

		if (positioned_parent_rect) {
			let offset = 0;
			const numericWidth = parseFloat(width_css);
			if (position === "left") {
				offset = parent_rect.left - positioned_parent_rect.left;
				sidebar_div.style.left = `${offset}px`;
			} else {
				offset = positioned_parent_rect.right - parent_rect.right;
				sidebar_div.style.right = `${offset}px`;
			}
			parent_container.style.setProperty(
				"--sidebar-overlap",
				`${numericWidth + offset}px`
			);
			parent_container.style.setProperty("--sidebar-offset", `${offset}px`);
			sidebar_div.style.setProperty("--sidebar-width", width_css);
		}
	}

	onMount(() => {
		sidebar_div.closest(".gradio-container")?.classList.add("sidebar-parent");
		check_overlap();

		window.addEventListener("resize", check_overlap);
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
	class:mounted={mounted}
	class:right={position === "right"}
	class:reduce-motion={prefersReducedMotion}
	bind:this={sidebar_div}
	style="width: {width_css};"
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
	:global(.sidebar-parent:not(:has(.reduce-motion))) {
		transition:
			padding-left 0.3s ease-in-out,
			padding-right 0.3s ease-in-out;
	}

	:global(.sidebar-parent:has(.sidebar.open:not(.right))) {
		padding-left: calc(
			var(--sidebar-overlap) - var(--sidebar-offset) - var(--size-4)
		);
	}

	:global(.sidebar-parent:has(.sidebar.open.right)) {
		padding-right: calc(
			var(--sidebar-overlap) - var(--sidebar-offset) - var(--size-4)
		);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		position: absolute;
		top: calc(var(--size-4) * -1);
		height: 100%;
		background-color: var(--background-fill-secondary);
		z-index: 1000;
	}

	.sidebar.open:not(.right) {
		box-shadow: var(--size-1) 0 var(--size-2) rgba(100, 89, 89, 0.1);
	}

	.sidebar.open.right {
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
		transition: none;
		width: var(--size-8);
		height: var(--size-8);
		z-index: 1001;
	}

	.toggle-button:not(.reduce-motion) {
		transition: all 0.3s ease-in-out;
	}

	.sidebar.mounted:not(.right):not(.open) .toggle-button {
		right: calc(var(--size-8) * -1);
	}

	.sidebar.right .toggle-button {
		left: calc(var(--size-8) * -1);
		transform: rotate(180deg);
	}

	.open:not(.right) .toggle-button, .sidebar:not(.mounted) .toggle-button {
		right: var(--size-2-5);
		transform: rotate(180deg);
	}

	.open.right .toggle-button, .sidebar:not(.mounted) .toggle-button {
		left: auto;
		right: var(--size-2-5);
		transform: rotate(0deg);
	}

	.sidebar:not(.mounted) .toggle-button {
		transition: none;
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

	/* Desktop styles (> 768px) */
	@media (min-width: 769px) {
		.sidebar:not(.right) {
			transform: translateX(-100%);
		}

		.sidebar.right {
			transform: translateX(100%);
		}

		.sidebar.open:not(.right) {
			transform: translateX(calc(-1 * var(--sidebar-overlap) - var(--size-4)));
		}

		.sidebar.open.right {
			transform: translateX(calc(var(--sidebar-overlap) + var(--size-4)));
		}

		.sidebar:not(.reduce-motion) {
			transition: transform 0.3s ease-in-out;
		}
	}

	/* Mobile styles (≤ 768px) */
	@media (max-width: 768px) {
		.sidebar {
			width: 100vw !important;
			left: -110vw !important;
			right: auto !important;
			position: absolute !important;
			top: calc(var(--size-4) * -1);
			height: 100vh !important;
		}

		.sidebar:not(.reduce-motion) {
			transition: transform 0.3s ease-in-out !important;
		}

		.sidebar.right {
			left: auto !important;
			right: -110vw !important;
		}

		.sidebar.open {
			transform: translateX(100vw) !important;
		}

		.sidebar.open.right {
			transform: translateX(-100vw) !important;
		}

		:global(.sidebar-parent) {
			padding-left: 0 !important;
			padding-right: 0 !important;
		}

		:global(.sidebar-parent:has(.sidebar.open)) {
			padding-left: 0 !important;
			padding-right: 0 !important;
		}

		.sidebar.right .toggle-button {
			left: calc(var(--size-8) * -1) !important;
			right: auto !important;
			transform: rotate(180deg) !important;
		}

		.sidebar.open.right .toggle-button {
			left: auto !important;
			right: var(--size-2-5) !important;
			transform: rotate(0deg) !important;
		}
	}
</style>

<script module lang="ts">
	// PROTOTYPE (#4278): the design is picked with `?tooltip_design=` so the
	// variants can be compared side by side before one is chosen.
	export type TooltipDesign = "icon" | "underline" | "hover" | "inline";
	const DESIGNS: TooltipDesign[] = ["icon", "underline", "hover", "inline"];

	function get_design(): TooltipDesign {
		if (typeof window === "undefined") return "icon";
		const param = new URLSearchParams(window.location.search).get(
			"tooltip_design"
		) as TooltipDesign | null;
		return param && DESIGNS.includes(param) ? param : "icon";
	}

	let id_counter = 0;
</script>

<script lang="ts">
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { Info as InfoIcon } from "@gradio/icons";
	import { render_inline_markdown } from "./inline-markdown";

	let {
		text,
		label_text = "",
		children
	}: {
		text: string;
		label_text?: string;
		children?: Snippet;
	} = $props();

	const design = get_design();
	const id = `gr-tooltip-${++id_counter}`;

	let anchor: HTMLElement | undefined = $state();
	let bubble: HTMLDivElement | undefined = $state();
	let open = $state(false);
	let pinned = $state(false);
	let placement: "top" | "bottom" = $state("top");
	let arrow_left = $state(0);

	let show_timer: ReturnType<typeof setTimeout> | undefined;
	let hide_timer: ReturnType<typeof setTimeout> | undefined;

	const GAP = 8;
	const EDGE = 8;

	function position(): void {
		if (!anchor || !bubble) return;
		const a = anchor.getBoundingClientRect();
		const b = bubble.getBoundingClientRect();
		const vw = document.documentElement.clientWidth;

		placement = a.top - b.height - GAP < EDGE ? "bottom" : "top";
		const top = placement === "top" ? a.top - b.height - GAP : a.bottom + GAP;

		const anchor_center = a.left + a.width / 2;
		let left = anchor_center - b.width / 2;
		left = Math.max(EDGE, Math.min(left, vw - b.width - EDGE));
		arrow_left = Math.max(12, Math.min(anchor_center - left, b.width - 12));

		bubble.style.top = `${top}px`;
		bubble.style.left = `${left}px`;
	}

	function show(): void {
		clearTimeout(hide_timer);
		if (open) return;
		open = true;
		bubble?.showPopover?.();
		position();
	}

	function hide(): void {
		clearTimeout(show_timer);
		if (!open) return;
		open = false;
		pinned = false;
		bubble?.hidePopover?.();
	}

	function schedule_show(): void {
		clearTimeout(hide_timer);
		clearTimeout(show_timer);
		show_timer = setTimeout(show, 120);
	}

	// A short grace period lets the pointer travel from the trigger into the
	// bubble without it closing (WCAG 1.4.13: content must be hoverable).
	function schedule_hide(): void {
		clearTimeout(show_timer);
		if (pinned) return;
		hide_timer = setTimeout(hide, 150);
	}

	function toggle_pinned(e: MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();
		if (pinned) {
			hide();
		} else {
			pinned = true;
			show();
		}
	}

	function on_keydown(e: KeyboardEvent): void {
		if (e.key === "Escape" && open) {
			e.stopPropagation();
			hide();
		}
	}

	// Inline disclosure state, used only by the "inline" design.
	let expanded = $state(false);

	onMount(() => {
		const on_scroll_or_resize = (): void => {
			if (open) position();
		};
		const on_pointerdown = (e: PointerEvent): void => {
			if (!pinned) return;
			const t = e.target as Node;
			if (anchor?.contains(t) || bubble?.contains(t)) return;
			hide();
		};
		const on_doc_keydown = (e: KeyboardEvent): void => {
			if (e.key === "Escape" && open) hide();
		};
		window.addEventListener("scroll", on_scroll_or_resize, true);
		window.addEventListener("resize", on_scroll_or_resize);
		document.addEventListener("pointerdown", on_pointerdown);
		document.addEventListener("keydown", on_doc_keydown);

		// The "hover" design listens on the whole component, not the label.
		let block: HTMLElement | null = null;
		const on_focusout = (e: FocusEvent): void => {
			if (!block?.contains(e.relatedTarget as Node)) hide();
		};
		if (design === "hover" && anchor) {
			block = anchor.closest(".block") as HTMLElement | null;
			block?.addEventListener("mouseenter", schedule_show);
			block?.addEventListener("mouseleave", schedule_hide);
			block?.addEventListener("focusin", show);
			block?.addEventListener("focusout", on_focusout);
			block?.setAttribute("aria-describedby", id);
		}

		return () => {
			clearTimeout(show_timer);
			clearTimeout(hide_timer);
			window.removeEventListener("scroll", on_scroll_or_resize, true);
			window.removeEventListener("resize", on_scroll_or_resize);
			document.removeEventListener("pointerdown", on_pointerdown);
			document.removeEventListener("keydown", on_doc_keydown);
			block?.removeEventListener("mouseenter", schedule_show);
			block?.removeEventListener("mouseleave", schedule_hide);
			block?.removeEventListener("focusin", show);
			block?.removeEventListener("focusout", on_focusout);
		};
	});

	let button_label = $derived(
		label_text ? `More information about ${label_text}` : "More information"
	);
</script>

<span class="tooltip-root design-{design}" bind:this={anchor}>
	{#if design === "underline"}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<span
			class="underline-trigger"
			tabindex="0"
			aria-describedby={id}
			onmouseenter={schedule_show}
			onmouseleave={schedule_hide}
			onfocus={show}
			onblur={hide}
			onclick={toggle_pinned}
			onkeydown={on_keydown}
			role="button">{@render children?.()}</span
		>
	{:else}
		{@render children?.()}
	{/if}

	{#if design === "icon"}
		<button
			type="button"
			class="icon-trigger"
			aria-label={button_label}
			aria-describedby={id}
			aria-expanded={open}
			onmouseenter={schedule_show}
			onmouseleave={schedule_hide}
			onfocus={show}
			onblur={() => !pinned && hide()}
			onclick={toggle_pinned}
			onkeydown={on_keydown}
		>
			<InfoIcon />
		</button>
	{:else if design === "inline"}
		<button
			type="button"
			class="icon-trigger"
			class:active={expanded}
			aria-label={button_label}
			aria-expanded={expanded}
			aria-controls={id}
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				expanded = !expanded;
			}}
		>
			<InfoIcon />
		</button>
		{#if expanded}
			<span class="inline-panel" {id}>
				{@html render_inline_markdown(text)}
			</span>
		{/if}
	{/if}

	{#if design !== "inline"}
		<div
			class="bubble placement-{placement}"
			{id}
			role="tooltip"
			popover="manual"
			bind:this={bubble}
			style:--arrow-left="{arrow_left}px"
			onmouseenter={() => clearTimeout(hide_timer)}
			onmouseleave={schedule_hide}
		>
			{@html render_inline_markdown(text)}
		</div>
	{/if}
</span>

<style>
	.tooltip-root {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 var(--size-1);
		max-width: 100%;
	}

	.icon-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: calc(var(--block-title-text-size, var(--text-sm)) + 2px);
		height: calc(var(--block-title-text-size, var(--text-sm)) + 2px);
		padding: 0;
		border: none;
		border-radius: var(--radius-full);
		background: none;
		color: var(--body-text-color-subdued);
		cursor: pointer;
		pointer-events: auto;
		transition: color 0.1s;
	}
	.icon-trigger:hover,
	.icon-trigger[aria-expanded="true"],
	.icon-trigger.active {
		color: var(--body-text-color);
	}
	.icon-trigger:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.underline-trigger {
		text-decoration: underline dotted;
		text-decoration-color: var(--body-text-color-subdued);
		text-underline-offset: 3px;
		cursor: help;
		pointer-events: auto;
	}
	.underline-trigger:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.inline-panel {
		display: block;
		flex-basis: 100%;
		margin-top: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		border-left: 2px solid var(--color-accent);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
		font-weight: var(--weight-regular);
		font-size: var(--text-sm);
		line-height: var(--line-md);
		white-space: normal;
		pointer-events: auto;
	}

	.bubble {
		position: fixed;
		inset: auto;
		margin: 0;
		box-sizing: border-box;
		max-width: min(280px, calc(100vw - 16px));
		padding: var(--spacing-md) var(--spacing-lg);
		border: none;
		border-radius: var(--radius-md);
		background: var(--body-text-color);
		color: var(--background-fill-primary);
		box-shadow: var(--shadow-drop-lg);
		font-weight: var(--weight-regular);
		font-size: var(--text-sm);
		line-height: var(--line-md);
		text-align: left;
		white-space: normal;
		overflow: visible;
		pointer-events: auto;
	}
	.bubble::after {
		content: "";
		position: absolute;
		left: var(--arrow-left);
		width: 8px;
		height: 8px;
		background: inherit;
		transform: translateX(-50%) rotate(45deg);
	}
	.bubble.placement-top::after {
		bottom: -4px;
	}
	.bubble.placement-bottom::after {
		top: -4px;
	}
	.bubble :global(a) {
		color: inherit;
		text-decoration: underline;
	}
	.bubble :global(code) {
		padding: 0.1em 0.3em;
		border-radius: 3px;
		background: color-mix(in srgb, currentColor 18%, transparent);
		font-size: 0.9em;
	}
</style>

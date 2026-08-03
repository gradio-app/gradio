<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		height = undefined,
		min_height = undefined,
		max_height = undefined,
		width = undefined,
		elem_id = "",
		elem_classes = [],
		variant = "solid",
		border_mode = "base",
		padding = true,
		type = "normal",
		test_id = undefined,
		explicit_call = false,
		container = true,
		visible = true,
		allow_overflow = true,
		overflow_behavior = "auto",
		scale = null,
		min_width = 0,
		flex = false,
		resizable = false,
		rtl = false,
		fullscreen = $bindable(false),
		label = undefined,
		children
	}: {
		height?: number | string | undefined;
		min_height?: number | string | undefined;
		max_height?: number | string | undefined;
		width?: number | string | undefined;
		elem_id?: string;
		elem_classes?: string[];
		variant?: "solid" | "dashed" | "none";
		border_mode?: "base" | "focus" | "contrast";
		padding?: boolean;
		type?: "normal" | "fieldset";
		test_id?: string | undefined;
		explicit_call?: boolean;
		container?: boolean;
		visible?: boolean | "hidden";
		allow_overflow?: boolean;
		overflow_behavior?: "visible" | "auto";
		scale?: number | null;
		min_width?: number;
		flex?: boolean;
		resizable?: boolean;
		rtl?: boolean;
		fullscreen?: boolean;
		label?: string | undefined;
		children?: Snippet;
	} = $props();

	let old_fullscreen = fullscreen;

	let element: HTMLElement | undefined = $state();

	let tag = $derived(type === "fieldset" ? "fieldset" : "div");

	// When visible is false the block is not rendered at all, so flex is
	// irrelevant; keep the historical behaviour of forcing it off.
	let is_flex = $derived(visible ? flex : false);

	let placeholder_height = $state(0);
	let placeholder_width = $state(0);
	let preexpansionBoundingRect: DOMRect | null = $state(null);
	let portal_parent: (Node & ParentNode) | null = null;
	let portal_marker: Comment | null = null;
	// Kept outside `$state` so teardown can still reach the element after
	// Svelte has cleared the `bind:this` binding.
	let portal_element: HTMLElement | null = null;

	function handleKeydown(event: KeyboardEvent): void {
		if (fullscreen && event.key === "Escape") {
			fullscreen = false;
		}
	}

	// The app container carries the theme variables, so keep the block inside it.
	function portal_target(el: HTMLElement): Node & ParentNode {
		const root = el.getRootNode();
		return (
			el.closest(".gradio-container") ??
			(root instanceof ShadowRoot ? root : document.body)
		);
	}

	// Measures where a `position: fixed` element pinned to the top left at a
	// 100% size lands when it is a child of `parent`.
	function fixed_probe_rect(parent: Node & ParentNode): DOMRect {
		const probe = document.createElement("div");
		probe.style.cssText =
			"position: fixed; top: 0; left: 0; width: 100%; height: 100%; visibility: hidden; pointer-events: none;";
		parent.appendChild(probe);
		const rect = probe.getBoundingClientRect();
		probe.remove();
		return rect;
	}

	// A `position: fixed` element is only laid out against the viewport when no
	// ancestor establishes a containing block for fixed descendants. Anything
	// with a transform, filter, backdrop-filter, perspective, contain or
	// container-type does establish one — `gr.Sidebar` always sets a transform,
	// for instance — and then top/left/width/height resolve against that
	// ancestor instead. Rather than enumerate those properties, compare a probe
	// where the block currently is with one in the container it would move to.
	function needs_portal(el: HTMLElement, target: Node & ParentNode): boolean {
		const parent = el.parentNode;
		if (!parent || parent === target) return false;
		const here = fixed_probe_rect(parent);
		const there = fixed_probe_rect(target);
		return (
			Math.abs(here.top - there.top) > 1 ||
			Math.abs(here.left - there.left) > 1 ||
			Math.abs(here.width - there.width) > 1 ||
			Math.abs(here.height - there.height) > 1
		);
	}

	// Moves the block to the app container so that its fixed positioning
	// resolves against the viewport. The placeholder that reserves the block's
	// space stays behind in the original parent, and `exit_portal` puts the
	// block back where it came from.
	function enter_portal(el: HTMLElement, target: Node & ParentNode): void {
		if (!el.parentNode || el.parentNode === target) return;
		portal_parent = el.parentNode;
		portal_element = el;
		portal_marker = document.createComment("fullscreen block");
		portal_parent.insertBefore(portal_marker, el);
		target.appendChild(el);
	}

	function exit_portal(): void {
		if (!portal_parent || !portal_element) return;
		const marker =
			portal_marker && portal_marker.parentNode === portal_parent
				? portal_marker
				: null;
		portal_parent.insertBefore(portal_element, marker);
		marker?.remove();
		portal_parent = null;
		portal_marker = null;
		portal_element = null;
	}

	$effect(() => {
		const el = element;
		if (fullscreen === old_fullscreen || !el) return;
		old_fullscreen = fullscreen;
		if (fullscreen) {
			preexpansionBoundingRect = el.getBoundingClientRect();
			placeholder_height = el.offsetHeight;
			placeholder_width = el.offsetWidth;
			const target = portal_target(el);
			if (needs_portal(el, target)) {
				enter_portal(el, target);
			}
			window.addEventListener("keydown", handleKeydown);
		} else {
			exit_portal();
			preexpansionBoundingRect = null;
			window.removeEventListener("keydown", handleKeydown);
		}
	});

	// Nothing reactive is read here, so this effect runs once and its cleanup
	// only fires on destroy — tearing down a block while it is fullscreen would
	// otherwise leak the keydown listener and the portal marker comment node.
	$effect(() => {
		return () => {
			window.removeEventListener("keydown", handleKeydown);
			exit_portal();
		};
	});

	const get_dimension = (
		dimension_value: string | number | undefined
	): string | undefined => {
		if (dimension_value === undefined) {
			return undefined;
		}
		if (typeof dimension_value === "number") {
			return dimension_value + "px";
		} else if (typeof dimension_value === "string") {
			return dimension_value;
		}
	};

	const resize = (e: MouseEvent): void => {
		const el = element;
		if (!el) return;
		let prevY = e.clientY;
		const onMouseMove = (e: MouseEvent): void => {
			const dy: number = e.clientY - prevY;
			prevY = e.clientY;
			el.style.height = `${el.offsetHeight + dy}px`;
		};
		const onMouseUp = (): void => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	};
	// When visible is False, we need to remove the component from the page
	// We can remove it by either modifying the AppTree in Blocks or by hiding the component here
	// We do it here because if visible is updated via an event, only the local state will be updated
	// and we would have to flow the state back up to modify the AppTree
</script>

{#if visible === true || visible === "hidden"}
	<svelte:element
		this={tag}
		bind:this={element}
		data-testid={test_id}
		id={elem_id}
		class:hidden={visible === "hidden"}
		class="block {elem_classes?.join(' ') || ''}"
		class:padded={padding}
		class:flex={is_flex}
		class:border_focus={border_mode === "focus"}
		class:border_contrast={border_mode === "contrast"}
		class:hide-container={!explicit_call && !container}
		style:height={fullscreen ? undefined : get_dimension(height)}
		style:min-height={fullscreen ? undefined : get_dimension(min_height)}
		style:max-height={fullscreen ? undefined : get_dimension(max_height)}
		class:fullscreen
		class:animating={fullscreen && preexpansionBoundingRect !== null}
		style:--start-top={preexpansionBoundingRect
			? `${preexpansionBoundingRect.top}px`
			: "0px"}
		style:--start-left={preexpansionBoundingRect
			? `${preexpansionBoundingRect.left}px`
			: "0px"}
		style:--start-width={preexpansionBoundingRect
			? `${preexpansionBoundingRect.width}px`
			: "0px"}
		style:--start-height={preexpansionBoundingRect
			? `${preexpansionBoundingRect.height}px`
			: "0px"}
		style:width={fullscreen
			? undefined
			: typeof width === "number"
				? `calc(min(${width}px, 100%))`
				: get_dimension(width)}
		style:border-style={variant}
		style:overflow={allow_overflow ? overflow_behavior : "hidden"}
		style:flex-grow={scale}
		style:min-width={`calc(min(${min_width}px, 100%))`}
		class:auto-margin={scale === null}
		dir={rtl ? "rtl" : "ltr"}
		aria-label={label}
	>
		{@render children?.()}
		{#if resizable}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<svg
				class="resize-handle"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 10 10"
				onmousedown={resize}
			>
				<line x1="1" y1="9" x2="9" y2="1" stroke="gray" stroke-width="0.5" />
				<line x1="5" y1="9" x2="9" y2="5" stroke="gray" stroke-width="0.5" />
			</svg>
		{/if}
	</svelte:element>
	{#if fullscreen}
		<div
			class="placeholder"
			style:height={placeholder_height + "px"}
			style:width={placeholder_width + "px"}
		></div>
	{/if}
{/if}

<style>
	.block {
		position: relative;
		margin: 0;
		box-shadow: var(--block-shadow);
		border-width: var(--block-border-width);
		border-color: var(--block-border-color);
		border-radius: var(--block-radius);
		background: var(--block-background-fill);
		width: 100%;
		line-height: var(--line-sm);
		border-width: var(--block-border-width);
	}
	.block.fullscreen {
		border-radius: 0;
	}

	.auto-margin {
		margin-left: auto;
		margin-right: auto;
	}

	.block.border_focus {
		border-color: var(--color-accent);
	}

	.block.border_contrast {
		border-color: var(--body-text-color);
	}

	.padded {
		padding: var(--block-padding);
	}

	.flex {
		display: flex;
		flex-direction: column;
	}

	.hidden {
		/* We use "hidden" class name in form/Index.svelte to hide parent forms, so if this class changes, edit form/Index.svelte accordingly */
		display: none;
	}
	.hide-container:not(.fullscreen) {
		margin: 0;
		box-shadow: none;
		border-width: 0;
		background: transparent;
		padding: 0;
		overflow: visible;
	}
	.resize-handle {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 10px;
		height: 10px;
		fill: var(--block-border-color);
		cursor: nwse-resize;
	}
	.fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		/* Percentages resolve against the viewport minus any classic window
		scrollbar; 100vw/100vh would extend beneath it and hide the top-right
		controls (#11982) */
		width: 100%;
		height: 100%;
		z-index: 1000;
		overflow: auto;
	}

	.animating {
		animation: pop-out 0.1s ease-out forwards;
	}

	@keyframes pop-out {
		0% {
			position: fixed;
			top: var(--start-top);
			left: var(--start-left);
			width: var(--start-width);
			height: var(--start-height);
			z-index: 100;
		}
		100% {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1000;
		}
	}

	.placeholder {
		border-radius: var(--block-radius);
		border-width: var(--block-border-width);
		border-color: var(--block-border-color);
		border-style: dashed;
	}
</style>

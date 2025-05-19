<script lang="ts">
	export let height: number | string | undefined = undefined;
	export let min_height: number | string | undefined = undefined;
	export let max_height: number | string | undefined = undefined;
	export let width: number | string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let variant: "solid" | "dashed" | "none" = "solid";
	export let border_mode: "base" | "focus" | "contrast" = "base";
	export let padding = true;
	export let type: "normal" | "fieldset" = "normal";
	export let test_id: string | undefined = undefined;
	export let explicit_call = false;
	export let container = true;
	export let visible = true;
	export let allow_overflow = true;
	export let overflow_behavior: "visible" | "auto" = "auto";
	export let scale: number | null = null;
	export let min_width = 0;
	export let flex = false;
	export let resizable = false;
	export let rtl = false;
	export let fullscreen = false;
	let old_fullscreen = fullscreen;

	let element: HTMLElement;

	let tag = type === "fieldset" ? "fieldset" : "div";

	let placeholder_height = 0;
	let placeholder_width = 0;
	let preexpansionBoundingRect: DOMRect | null = null;

	function handleKeydown(event: KeyboardEvent): void {
		if (fullscreen && event.key === "Escape") {
			fullscreen = false;
		}
	}

	$: if (fullscreen !== old_fullscreen) {
		old_fullscreen = fullscreen;
		if (fullscreen) {
			preexpansionBoundingRect = element.getBoundingClientRect();
			placeholder_height = element.offsetHeight;
			placeholder_width = element.offsetWidth;
			window.addEventListener("keydown", handleKeydown);
		} else {
			preexpansionBoundingRect = null;
			window.removeEventListener("keydown", handleKeydown);
		}
	}

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

	$: if (!visible) {
		flex = false;
	}

	const resize = (e: MouseEvent): void => {
		let prevY = e.clientY;
		const onMouseMove = (e: MouseEvent): void => {
			const dy: number = e.clientY - prevY;
			prevY = e.clientY;
			element.style.height = `${element.offsetHeight + dy}px`;
		};
		const onMouseUp = (): void => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	};
</script>

<svelte:element
	this={tag}
	bind:this={element}
	data-testid={test_id}
	id={elem_id}
	class:hidden={visible === false}
	class="block {elem_classes?.join(' ') || ''}"
	class:padded={padding}
	class:flex
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
	style:border-width="var(--block-border-width)"
	class:auto-margin={scale === null}
	dir={rtl ? "rtl" : "ltr"}
>
	<slot />
	{#if resizable}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<svg
			class="resize-handle"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 10 10"
			on:mousedown={resize}
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

	.hidden {
		display: none;
	}

	.flex {
		display: flex;
		flex-direction: column;
	}
	.hide-container:not(.fullscreen) {
		margin: 0;
		box-shadow: none;
		--block-border-width: 0;
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
		width: 100vw;
		height: 100vh;
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
			top: 0vh;
			left: 0vw;
			width: 100vw;
			height: 100vh;
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

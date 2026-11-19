<script lang="ts">
	let {
		label = null,
		Icon,
		show_label = true,
		disable = false,
		float = true,
		rtl = false
	}: {
		label?: string | null;
		Icon: any;
		show_label?: boolean;
		disable?: boolean;
		float?: boolean;
		rtl?: boolean;
	} = $props();

	let label_el: HTMLLabelElement | undefined = $state();
	let hovered = $state(false);

	// Buttons in the corner can cover a long label. Reveal it on hover by raising
	// it above them. The label keeps `pointer-events: none`, so clicks and drags
	// (e.g. drawing on an image editor canvas) still reach what is underneath:
	// hover is detected from pointer moves on the parent instead.
	$effect(() => {
		const el = label_el;
		const host = el?.parentElement;
		if (!el || !host || !float || !show_label || disable) return;

		const on_move = (event: PointerEvent): void => {
			const target = event.target as Element | null;
			if (event.buttons !== 0 || target?.closest("button, a, input")) {
				hovered = false;
				return;
			}
			const rect = el.getBoundingClientRect();
			hovered =
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom;
		};
		const on_leave = (): void => {
			hovered = false;
		};

		host.addEventListener("pointermove", on_move);
		host.addEventListener("pointerleave", on_leave);
		return () => {
			host.removeEventListener("pointermove", on_move);
			host.removeEventListener("pointerleave", on_leave);
			hovered = false;
		};
	});
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label
	bind:this={label_el}
	class:hovered
	class:hide={!show_label}
	class:sr-only={!show_label}
	class:float
	class:hide-label={disable}
	data-testid="block-label"
	dir={rtl ? "rtl" : "ltr"}
>
	<span>
		<Icon />
	</span>
	{label}
</label>

<style>
	label {
		display: inline-flex;
		align-items: center;
		z-index: var(--layer-2);
		box-shadow: var(--block-label-shadow);
		border: var(--block-label-border-width) solid
			var(--block-label-border-color);
		border-top: none;
		border-left: none;
		border-radius: var(--block-label-radius);
		background: var(--block-label-background-fill);
		padding: var(--block-label-padding);
		pointer-events: none;
		color: var(--block-label-text-color);
		font-weight: var(--block-label-text-weight);
		font-size: var(--block-label-text-size);
		line-height: var(--line-sm);
	}
	:global(.gr-group) label {
		border-top-left-radius: 0;
	}

	label.float {
		position: absolute;
		top: var(--block-label-margin);
		left: var(--block-label-margin);
	}

	label.float.hovered {
		z-index: var(--layer-top);
		max-width: calc(100% - 2 * var(--block-label-margin));
	}
	label:not(.float) {
		position: static;
		margin-top: var(--block-label-margin);
		margin-left: var(--block-label-margin);
	}

	.hide {
		display: none;
	}

	span {
		opacity: 0.8;
		margin-right: var(--size-2);
		width: calc(var(--block-label-text-size) - 1px);
		height: calc(var(--block-label-text-size) - 1px);
	}
	.hide-label {
		box-shadow: none;
		border-width: 0;
		background: transparent;
		overflow: visible;
	}

	label[dir="rtl"] {
		border: var(--block-label-border-width) solid
			var(--block-label-border-color);
		border-top: none;
		border-right: none;
		border-bottom-left-radius: var(--block-radius);
		border-bottom-right-radius: var(--block-label-radius);
		border-top-left-radius: var(--block-label-radius);
	}

	label[dir="rtl"] span {
		margin-left: var(--size-2);
		margin-right: 0;
	}
</style>

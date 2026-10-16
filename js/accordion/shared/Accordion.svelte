<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		open = $bindable(true),
		label = "",
		height,
		max_height,
		onexpand,
		oncollapse,
		children
	}: {
		open: boolean;
		label: string;
		height?: string;
		max_height?: string;
		onexpand?: () => void;
		oncollapse?: () => void;
		children?: Snippet;
	} = $props();
</script>

<button
	onclick={() => {
		open = !open;
		if (open) {
			onexpand?.();
		} else {
			oncollapse?.();
		}
	}}
	class="label-wrap"
	class:open
>
	<span>{label}</span>
	<span style:transform={open ? "rotate(0)" : "rotate(-90deg)"} class="icon">
		<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M4 6l4 4 4-4"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</span>
</button>
<div
	data-testid="accordion-content"
	class:scrollable={height || max_height}
	style:display={open ? "block" : "none"}
	style:height
	style:max-height={max_height}
>
	{@render children?.()}
</div>

<style>
	span {
		font-weight: var(--section-header-text-weight);
		font-size: var(--section-header-text-size);
	}
	.label-wrap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		width: var(--size-full);
		color: var(--accordion-text-color);
	}
	.label-wrap.open {
		margin-bottom: var(--size-2);
	}

	.icon {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 999px;
		color: var(--body-text-color-subdued);
		transition: transform 150ms ease-out;
	}

	.icon svg {
		width: 16px;
		height: 16px;
	}

	.label-wrap:hover .icon {
		background: var(--input-background-fill);
		color: var(--body-text-color);
	}

	.scrollable {
		overflow-y: auto;
	}
</style>

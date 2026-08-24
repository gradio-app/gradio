<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		open = $bindable(true),
		label = "",
		onexpand,
		oncollapse,
		children
	}: {
		open: boolean;
		label: string;
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
	<span style:transform={open ? "rotate(0)" : "rotate(90deg)"} class="icon">
		▼
	</span>
</button>
<div data-testid="accordion-content" style:display={open ? "block" : "none"}>
	{@render children?.()}
</div>

<style>
	span {
		font-weight: var(--section-header-text-weight);
		font-size: var(--section-header-text-size);
	}
	.label-wrap {
		display: flex;
		justify-content: space-between;
		cursor: pointer;
		width: var(--size-full);
		color: var(--accordion-text-color);
	}
	.label-wrap.open {
		margin-bottom: var(--size-2);
	}

	.icon {
		transition: 150ms;
	}
</style>

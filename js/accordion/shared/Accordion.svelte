<script lang="ts">
	import { writable } from "svelte/store";

	export let initial_open = true;
	export let label = "";

	let open = writable(initial_open);

	const toggle_open = (): void => {
		open.update((value) => !value);
	};
</script>

<button on:click={toggle_open} class="label-wrap" class:open={$open}>
	<span>{label}</span>
	<span style:transform={$open ? "rotate(0)" : "rotate(90deg)"} class="icon">
		▼
	</span>
</button>
<div style:display={$open ? "block" : "none"}>
	<slot />
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
	}
	.label-wrap.open {
		margin-bottom: var(--size-2);
	}

	.icon {
		transition: 150ms;
	}
</style>

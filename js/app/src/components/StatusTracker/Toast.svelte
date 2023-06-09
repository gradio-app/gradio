<script lang="ts">
	import { flip } from "svelte/animate";
	import Error from "./Error.svelte";

	export let messages: {
		type: "error" | "marning" | "info";
		message: string;
		id: number;
	}[] = [];
</script>

<div class="toast-wrap">
	{#each messages as { type, message, id } (id)}
		<div animate:flip={{ duration: 300 }} style:width="100%">
			{#if type === "error"}
				<Error {message} on:close {id} />
			{/if}
		</div>
	{/each}
</div>

<style>
	.toast-wrap {
		z-index: var(--layer-top);
		position: fixed;
		right: var(--size-4);
		bottom: var(--size-4);
		display: flex;
		flex-direction: column-reverse;
		gap: var(--size-2);
		align-items: end;
		width: calc(100% - var(--size-8));
	}

	@media (--screen-sm) {
		.toast-wrap {
			width: calc(var(--size-96) + var(--size-10));
			flex-direction: column;
			bottom: unset;
			top: var(--size-4);
		}
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
	import { flip } from "svelte/animate";
	import Error from "./Error.svelte";
	import type { ToastMessage } from "./types";

	export let messages: ToastMessage[] = [];

	$: scroll_to_top(messages);

	function scroll_to_top(_messages: ToastMessage[]): void {
		if (_messages.length > 0) {
			if ("parentIFrame" in window) {
				let is_large = window.matchMedia("(min-width: 640px)").matches;
				console.log(parentIFrame.getPageInfo(false));

				parentIFrame.scrollTo(
					0,
					is_large ? 0 : parentIFrame.getPageInfo(false).documentHeight
				);
			}
		}
	}
</script>

<div class="toast-wrap">
	{#each messages as { type, message, id } (id)}
		<div animate:flip={{ duration: 300 }} style:width="100%">
			<Error {message} on:close {id} />
		</div>
	{/each}
</div>

<style>
	.toast-wrap {
		display: flex;
		position: fixed;
		right: var(--size-4);
		bottom: var(--size-4);
		flex-direction: column-reverse;
		align-items: end;
		gap: var(--size-2);
		z-index: var(--layer-top);
		width: calc(100% - var(--size-8));
	}

	@media (--screen-sm) {
		.toast-wrap {
			top: var(--size-4);
			bottom: unset;
			flex-direction: column;
			width: calc(var(--size-96) + var(--size-10));
		}
	}
</style>

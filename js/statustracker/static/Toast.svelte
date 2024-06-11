<script lang="ts">
	import { flip } from "svelte/animate";
	import type { ToastMessage } from "./types";
	import ToastContent from "./ToastContent.svelte";

	export let messages: ToastMessage[] = [];

	$: scroll_to_top(messages);

	function scroll_to_top(_messages: ToastMessage[]): void {
		if (_messages.length > 0) {
			if ("parentIFrame" in window) {
				window.parentIFrame?.scrollTo(0, 0);
			}
		}
	}
</script>

<div class="toast-wrap">
	{#each messages as { type, message, id, duration, visible } (id)}
		<div animate:flip={{ duration: 300 }} style:width="100%">
			<ToastContent {type} {message} {duration} {visible} on:close {id} />
		</div>
	{/each}
</div>

<style>
	.toast-wrap {
		display: flex;
		position: fixed;
		top: var(--size-4);
		right: var(--size-4);

		flex-direction: column;
		align-items: end;
		gap: var(--size-2);
		z-index: var(--layer-top);
		width: calc(100% - var(--size-8));
	}

	@media (--screen-sm) {
		.toast-wrap {
			width: calc(var(--size-96) + var(--size-10));
		}
	}
</style>

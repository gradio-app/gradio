<script lang="ts">
	import { flip } from "svelte/animate";
	import type { ToastMessage } from "./types";
	import ToastContent from "./ToastContent.svelte";
	import { spring } from "svelte/motion";

	export let messages: ToastMessage[] = [];
	const top = spring(0, { stiffness: 0.4, damping: 0.5 });

	$: scroll_to_top(messages);

	function scroll_to_top(_messages: ToastMessage[]): void {
		if (_messages.length > 0) {
			if ("parentIFrame" in window) {
				window.parentIFrame?.getPageInfo((page_info) => {
					if (page_info.scrollTop < page_info.offsetTop) {
						top.set(0);
					} else {
						top.set(page_info.scrollTop - page_info.offsetTop);
					}
				});
			}
		}
	}
</script>

<div class="toast-wrap" style="--toast-top: {$top}px;">
	{#each messages as { type, title, message, id, duration, visible } (id)}
		<div animate:flip={{ duration: 300 }} style:width="100%">
			<ToastContent
				{type}
				{title}
				{message}
				{duration}
				{visible}
				on:close
				{id}
			/>
		</div>
	{/each}
</div>

<style>
	.toast-wrap {
		--toast-top: var(--size-4);
		display: flex;
		position: fixed;
		top: calc(var(--toast-top) + var(--size-3));
		right: var(--size-3);
		left: var(--size-3);
		flex-direction: column;
		align-items: stretch;
		gap: var(--size-2);
		z-index: var(--layer-top);
		max-width: 100%;
	}

	@media (--screen-sm) {
		.toast-wrap {
			left: auto;
			right: var(--size-4);
			width: auto;
			max-width: min(90vw, var(--size-96));
			align-items: end;
		}
	}
</style>

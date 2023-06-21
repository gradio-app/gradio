<script lang="ts">
	import { flip } from "svelte/animate";
	import type { ToastMessage } from "./types";
	import ToastContent from "./ToastContent.svelte";
	import type { ThemeMode } from "../types";

	export let theme_mode: ThemeMode;
	export let messages: ToastMessage[] = [];
</script>

<div class="toast-wrap">
	{#each messages as { type, message, id } (id)}
		<div animate:flip={{ duration: 300 }} style:width="100%">
			{#if type === "warning"}
				<ToastContent
					{type}
					{message}
					description="Warning"
					theme_color={"orange"}
					{theme_mode}
					on:close
					{id}
				/>
			{:else if type === "info"}
				<ToastContent
					{type}
					{message}
					description="Notification"
					theme_color={"grey"}
					{theme_mode}
					on:close
					{id}
				/>
			{:else if type === "error"}
				<ToastContent
					{type}
					{message}
					description="Error"
					theme_color={"red"}
					{theme_mode}
					on:close
					{id}
				/>
			{/if}
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

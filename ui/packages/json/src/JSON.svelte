<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import JSONNode from "./JSONNode.svelte";

	export let value: any = {};

	let copied = false;
	let timer: NodeJS.Timeout;

	function copy_feedback() {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	async function handle_copy() {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
			copy_feedback();
		}
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<button
	on:click={handle_copy}
	class="transition-color overflow-hidden font-sans absolute right-0 top-0  rounded-bl-lg shadow-sm text-xs text-gray-500 flex items-center  bg-white z-20 border-l border-b border-gray-100"
>
	<span class="py-1 px-2">copy to clipboard</span>
	{#if copied}
		<span
			in:fade={{ duration: 100 }}
			out:fade={{ duration: 350 }}
			class="font-bold dark:text-green-400 text-green-600 py-1 px-2 absolute block w-full text-left bg-white dark:bg-gray-900"
			>COPIED</span
		>
	{/if}
</button>

<JSONNode {value} depth={0} />

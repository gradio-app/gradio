<script lang="ts">
	import { onDestroy } from "svelte";
	import { Copy, Check } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";

	let copied = false;
	export let value: string;
	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			copy_feedback();
		}
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<IconButton Icon={copied ? Check : Copy} on:click={handle_copy} />

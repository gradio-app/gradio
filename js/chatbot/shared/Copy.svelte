<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { onDestroy } from "svelte";
	import { Copy, Check } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";
	import type { CopyData } from "@gradio/utils";
	const dispatch = createEventDispatcher<{
		change: undefined;
		copy: CopyData;
	}>();

	let copied = false;
	export let value: string;
	export let watermark: string | null = null;
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
			dispatch("copy", { value: value });
			const text_to_copy = watermark ? `${value}\n\n${watermark}` : value;
			await navigator.clipboard.writeText(text_to_copy);
			copy_feedback();
		} else {
			const textArea = document.createElement("textarea");
			const text_to_copy = watermark ? `${value}\n\n${watermark}` : value;
			textArea.value = text_to_copy;

			textArea.style.position = "absolute";
			textArea.style.left = "-999999px";

			document.body.prepend(textArea);
			textArea.select();

			try {
				document.execCommand("copy");
				copy_feedback();
			} catch (error) {
				console.error(error);
			} finally {
				textArea.remove();
			}
		}
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<IconButton
	on:click={handle_copy}
	label={copied ? "Copied message" : "Copy message"}
	Icon={copied ? Check : Copy}
/>

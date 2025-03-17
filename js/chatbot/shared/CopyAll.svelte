<script lang="ts">
	import { onDestroy } from "svelte";
	import { Copy, Check } from "@gradio/icons";
	import type { NormalisedMessage } from "../types";
	import { IconButton } from "@gradio/atoms";

	let copied = false;
	export let value: NormalisedMessage[] | null;
	export let watermark: string | null = null;

	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	const copy_conversation = (): void => {
		if (value) {
			const conversation_value = value
				.map((message) => {
					if (message.type === "text") {
						return `${message.role}: ${message.content}`;
					}
					return `${message.role}: ${message.content.value.url}`;
				})
				.join("\n\n");

			const text_to_copy = watermark
				? `${conversation_value}\n\n${watermark}`
				: conversation_value;

			navigator.clipboard.writeText(text_to_copy).catch((err) => {
				console.error("Failed to copy conversation: ", err);
			});
		}
	};

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			copy_conversation();
			copy_feedback();
		}
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<IconButton
	Icon={copied ? Check : Copy}
	on:click={handle_copy}
	label={copied ? "Copied conversation" : "Copy conversation"}
></IconButton>

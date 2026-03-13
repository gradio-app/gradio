<script lang="ts">
	import Copy from "./Copy.svelte";
	import Download from "./Download.svelte";
	import { IconButtonWrapper } from "@gradio/atoms";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	interface Props {
		value: string;
		language: string;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
	}

	let {
		value,
		language,
		buttons = null,
		on_custom_button_click = null
	}: Props = $props();
</script>

<IconButtonWrapper {buttons} {on_custom_button_click}>
	{#if buttons?.some((btn) => typeof btn === "string" && btn === "download")}
		<Download {value} {language} />
	{/if}
	{#if buttons?.some((btn) => typeof btn === "string" && btn === "copy")}
		<Copy {value} />
	{/if}
</IconButtonWrapper>

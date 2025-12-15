<script lang="ts">
	import Copy from "./Copy.svelte";
	import Download from "./Download.svelte";
	import { IconButtonWrapper } from "@gradio/atoms";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";

	export let value: string;
	export let language: string;
	export let buttons: (string | CustomButtonType)[] | null = null;
	export let on_custom_button_click: ((id: number) => void) | null = null;
</script>

<IconButtonWrapper {buttons} on_custom_button_click={on_custom_button_click}>
	{#if buttons?.some((btn) => typeof btn === "string" && btn === "download")}
		<Download {value} {language} />
	{/if}
	{#if buttons?.some((btn) => typeof btn === "string" && btn === "copy")}
		<Copy {value} />
	{/if}
</IconButtonWrapper>

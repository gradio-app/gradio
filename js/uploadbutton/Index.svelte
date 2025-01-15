<script lang="ts" context="module">
	export { default as BaseUploadButton } from "./shared/UploadButton.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import type { FileData } from "@gradio/client";
	import UploadButton from "./shared/UploadButton.svelte";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let label: string | null;
	export let value: null | FileData | FileData[];
	export let file_count: string;
	export let file_types: string[] = [];
	export let root: string;
	export let size: "sm" | "lg" = "lg";
	export let scale: number | null = null;
	export let icon: FileData | null = null;
	export let min_width: number | undefined = undefined;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let gradio: Gradio<{
		change: never;
		upload: never;
		click: never;
		error: string;
	}>;
	export let interactive: boolean;

	$: disabled = !interactive;

	async function handle_event(
		detail: null | FileData | FileData[],
		event: "change" | "upload" | "click"
	): Promise<void> {
		value = detail;
		gradio.dispatch(event);
	}
</script>

<UploadButton
	{elem_id}
	{elem_classes}
	{visible}
	{file_count}
	{file_types}
	{size}
	{scale}
	{icon}
	{min_width}
	{root}
	{value}
	{disabled}
	{variant}
	{label}
	max_file_size={gradio.max_file_size}
	on:click={() => gradio.dispatch("click")}
	on:change={({ detail }) => handle_event(detail, "change")}
	on:upload={({ detail }) => handle_event(detail, "upload")}
	on:error={({ detail }) => {
		gradio.dispatch("error", detail);
	}}
	upload={(...args) => gradio.client.upload(...args)}
>
	{label ? gradio.i18n(label) : ""}
</UploadButton>

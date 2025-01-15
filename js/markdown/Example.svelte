<script lang="ts">
	import { MarkdownCode } from "@gradio/markdown-code";

	export let value: string | null;
	export let type: "gallery" | "table";
	export let selected = false;
	export let sanitize_html: boolean;
	export let line_breaks: boolean;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let root: string;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
	class="prose"
>
	<MarkdownCode
		message={value ? value : ""}
		{latex_delimiters}
		{sanitize_html}
		{line_breaks}
		chatbot={false}
		{root}
	/>
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>

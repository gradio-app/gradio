<script lang="ts">
	import { MarkdownCode } from "@gradio/markdown-code";

	let {
		value,
		type,
		selected = false,
		sanitize_html,
		line_breaks,
		latex_delimiters
	}: {
		value: string | null;
		type: "gallery" | "table";
		selected?: boolean;
		sanitize_html: boolean;
		line_breaks: boolean;
		latex_delimiters: {
			left: string;
			right: string;
			display: boolean;
		}[];
	} = $props();

	function truncate_text(text: string | null, max_length = 60): string {
		if (!text) return "";
		const str = String(text);
		if (str.length <= max_length) return str;
		return str.slice(0, max_length) + "...";
	}
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
	class="prose"
>
	<MarkdownCode
		message={truncate_text(value)}
		{latex_delimiters}
		{sanitize_html}
		{line_breaks}
		chatbot={false}
	/>
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>

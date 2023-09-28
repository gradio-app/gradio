<script lang="ts">
	import MarkdownCode from "../static/MarkdownCode.svelte";

	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
	class="prose"
>
	<MarkdownCode message={value} chatbot={false} sanitize_html={true} />
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>

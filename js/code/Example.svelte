<script lang="ts">
	export let value: string | null;
	export let type: "gallery" | "table";
	export let selected = false;

	function truncate_text(text: string | null, max_length = 60): string {
		if (!text) return "";
		const str = String(text);
		if (str.length <= max_length) return str;
		return str.slice(0, max_length) + "...";
	}
</script>

<pre
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected>{truncate_text(value)}</pre>

<style>
	pre {
		text-align: left;
	}
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>

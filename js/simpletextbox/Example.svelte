<script lang="ts">
	import { onMount } from "svelte";

	let {
		value,
		type,
		selected = false
	}: {
		value: string | null;
		type: "gallery" | "table";
		selected?: boolean;
	} = $props();

	let size = $state(0);
	let el: HTMLDivElement | undefined = $state();

	function set_styles(element: HTMLElement, el_width: number): void {
		element.style.setProperty(
			"--local-text-width",
			`${el_width && el_width < 150 ? el_width : 200}px`
		);
		element.style.whiteSpace = "unset";
	}

	function truncate_text(text: string | null, max_length = 60): string {
		if (!text) return "";
		const str = String(text);
		if (str.length <= max_length) return str;
		return str.slice(0, max_length) + "...";
	}

	onMount(() => {
		if (el) set_styles(el, size);
	});
</script>

<div
	bind:clientWidth={size}
	bind:this={el}
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{truncate_text(value)}
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}

	div {
		overflow: hidden;
		min-width: var(--local-text-width);

		white-space: nowrap;
	}
</style>

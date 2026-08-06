<script lang="ts">
	let {
		value,
		type,
		selected = false,
		choices
	}: {
		value: string | null;
		type: "gallery" | "table";
		selected?: boolean;
		choices: [string, string | number][];
	} = $props();

	let name_string = $derived.by(() => {
		if (value === null) return "";
		const name = choices.find((pair) => pair[1] === value);
		return name ? name[0] : "";
	});
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{name_string}
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>

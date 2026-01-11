<script lang="ts">
	let {
		value,
		type,
		selected = false,
		choices
	}: {
		value: string | string[] | null;
		type: "gallery" | "table";
		selected?: boolean;
		choices: [string, string | number][];
	} = $props();

	let value_array = value ? (Array.isArray(value) ? value : [value]) : [];
	let names = value_array
		.map(
			(val) =>
				(
					choices.find((pair) => pair[1] === val) as
						| [string, string | number]
						| undefined
				)?.[0]
		)
		.filter((name) => name !== undefined);
	let names_string = names.join(", ");
</script>

<div
	class:table={type === "table"}
	class:gallery={type === "gallery"}
	class:selected
>
	{names_string}
</div>

<style>
	.gallery {
		padding: var(--size-1) var(--size-2);
	}
</style>

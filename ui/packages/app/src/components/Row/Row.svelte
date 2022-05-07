<script lang="ts">
	export let value: boolean;
	export let default_value: boolean;
	export let style: string = "";
	export let parent: string | null = null;

	if (default_value) value = default_value;
</script>

<div
	{style}
	class:hidden={!value}
	class="flex flex-col md:flex-row gap-3 "
	class:flex-1={parent === "row" || !parent}
>
	<slot />
</div>

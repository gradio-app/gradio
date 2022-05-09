<script lang="ts">
	export let style: string = "";
	export let parent: string | null = null;
	export let default_value: boolean = true;

	if (default_value) value = default_value;
</script>

<div
	{style}
	class:hidden={!value}
	class="flex flex-col md:flex-row gr-gap gr-form-gap row w-full"
	class:flex-1={parent === "row"}
>
	<slot />
</div>

<script lang="ts">
	export let value: boolean = true;
	export let default_value: boolean;
	export let style: string = "";
	export let variant: "default" | "panel" = "default";
	export let parent: string | null = null;

	if (default_value) value = default_value;
</script>

<div
	{style}
	class:hidden={!value}
	class:bg-gray-50={variant === "panel"}
	class:p-2={variant === "panel"}
	class:rounded-lg={variant === "panel"}
	class="flex flex-col gr-gap gr-form-gap relative col overflow-auto"
	class:flex-1={parent === "row" || !parent}
>
	<slot />
</div>

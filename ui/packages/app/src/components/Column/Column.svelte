<script lang="ts">
	export let elem_id: string = "";
	export let variant: "default" | "panel" = "default";
	export let parent: string | null = null;
</script>

<div
	id={elem_id}
	class:bg-gray-50={variant === "panel"}
	class:p-2={variant === "panel"}
	class:rounded-lg={variant === "panel"}
	class="flex flex-col gr-gap gr-form-gap relative col overflow-auto"
	class:flex-1={parent === "row" || !parent}
>
	<slot />
</div>

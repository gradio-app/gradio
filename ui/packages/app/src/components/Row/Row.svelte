<script lang="ts">
	export let style: Record<string, string> = {};
	export let parent: string | null = null;
</script>

<div
	{style}
	class="flex flex-col md:flex-row gr-gap gr-form-gap row w-full flex-none"
	class:flex-1={parent === "row"}
>
	<slot />
</div>

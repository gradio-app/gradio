<script lang="ts">
	export let value: boolean = true;
	export let style: string = "";

	if ($$props.default) value = $$props.default;
</script>

<div {style} class:hidden={!value} class="flex flex-1 flex-col gap-4">
	<slot />
</div>

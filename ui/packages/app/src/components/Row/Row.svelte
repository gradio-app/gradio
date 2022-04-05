<script lang="ts">
	export let value: boolean;
	export let style: string = "";

	if ($$props.default_value) value = $$props.default_value;
</script>

<div {style} class:hidden={!value} class="flex flex-row gap-4">
	<slot />
</div>

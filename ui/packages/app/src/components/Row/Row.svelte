<script lang="ts">
	export let value: boolean;
	export let default_value: boolean;
	export let style: string = "";

	if (default_value) value = default_value;
</script>

<div {style} class:hidden={!value} class="flex flex-col md:flex-row gap-3">
	<slot />
</div>

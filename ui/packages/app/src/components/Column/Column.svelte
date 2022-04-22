<script lang="ts">
	export let value: boolean = true;
	export let default_value: boolean;
	export let style: string = "";

	if (default_value) value = default_value;
</script>

<div
	{style}
	class:hidden={!value}
	class="flex flex-1 flex-col gr-gap gr-form-gap relative"
>
	<slot />
</div>

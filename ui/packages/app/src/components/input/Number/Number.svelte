<script lang="ts">
	export let value: number;
	export let setValue: (val: number) => number;
	export let theme: string;
</script>

<input
	type="number"
	class="input-number w-full rounded box-border p-2 focus:outline-none appearance-none"
	{value}
	on:input={(e) => setValue(e.target.value)}
	{theme}
/>

<style lang="postcss" global>
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type="number"] {
		-moz-appearance: textfield;
	}
	.input-number[theme="default"] {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>

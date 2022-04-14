<script lang="ts">
	export let value: string;
	export let setValue: (val: string) => string;
	export let theme: string;
	export let lines: number;
	export let placeholder: string;
</script>

{#if lines > 1}
	<textarea
		class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
		{value}
		{placeholder}
		rows={lines}
		on:input={(e) => setValue(e.target.value)}
		{theme}
	/>
{:else}
	<input
		type="text"
		class="input-text w-full rounded box-border p-2 focus:outline-none appearance-none"
		{value}
		{placeholder}
		on:change={(e) => setValue(e.target.value)}
		{theme}
	/>
{/if}

<style lang="postcss" global>
	.input-text[theme="default"] {
		@apply shadow transition hover:shadow-md dark:bg-gray-800;
	}
</style>

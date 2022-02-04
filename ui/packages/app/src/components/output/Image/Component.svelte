<script lang="ts">
	export let value: string;
	export let theme: string;
</script>

<div
	class="output-image w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
	{theme}
>
	<!-- svelte-ignore a11y-missing-attribute -->
	<img class="w-full h-full object-contain" src={value} />
</div>

<style lang="postcss">
</style>

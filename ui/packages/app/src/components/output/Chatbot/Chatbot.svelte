<script lang="ts">
	export let value: Array<string>;
</script>

<div class="overflow-y-auto h-64 border border-b-0 rounded-t-lg leading-tight">
	<div class="flex flex-col items-end space-y-4 p-3">
		{#each value as message}
			<div
				class="px-3 py-2 rounded-2xl place-self-start bg-gray-300 dark:bg-gray-850 dark:text-gray-200 mr-7"
			>
				{message[1]}
			</div>
			<div class="px-3 py-2 rounded-2xl bg-yellow-500 text-white ml-7">
				{message[0]}
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
</style>

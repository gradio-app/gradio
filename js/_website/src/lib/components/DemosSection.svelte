<script lang="ts">
	import Demos from "$lib/components/Demos.svelte";
	export let demos = [] as any[];
	let current_selection = 0;
	let url_version = "4+";
</script>

<div class="grid">
	<div class="demo-window overflow-y-auto h-fit w-full mb-4">
		<div
			class="relative mx-auto my-auto rounded-md bg-white dark:bg-neutral-800"
			style="top: 5%; height: 90%"
		>
			<div class="flex overflow-auto pt-4">
				{#each demos as demo, i}
					<button
						on:click={() => (current_selection = i)}
						class:selected-demo-tab={current_selection == i}
						class="demo-btn px-4 py-2 text-lg min-w-max text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
						name={demo[0]}>{demo[0]}</button
					>
				{/each}
			</div>
			{#each demos as demo, i}
				<div
					class:hidden={current_selection !== i}
					class:selected-demo-window={current_selection == i}
					class="demo-content px-4"
				>
					<Demos
						name={demo[0]}
						code={demo[1]}
						highlighted_code={demo[1]}
						{url_version}
					/>
				</div>
			{/each}
		</div>
	</div>
</div>

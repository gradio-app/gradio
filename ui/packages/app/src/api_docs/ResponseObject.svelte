<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
	import Loader from "../components/StatusTracker/Loader.svelte";

	export let dependency: Dependency;
	export let dependency_index: number;
	export let instance_map: {
		[id: number]: ComponentMeta;
	};

	export let dependency_outputs: any[][];

	export let is_running: boolean;
</script>

<h4 class="font-bold mt-6 mb-3 flex items-center">
	<div
		class="flex items-center h-1 w-3 bg-gray-300 dark:bg-gray-500 rounded-full mr-2"
	>
		<div
			class="rounded-full h-1.5 w-1.5 bg-gray-700 dark:bg-gray-400 ml-auto"
		/>
	</div>
	Response Object
</h4>
<div
	class="bg-white border dark:bg-gray-800 p-4 font-mono text-sm rounded-lg flex flex-col"
>
	<div class={is_running ? "hidden" : ""}>
		&#123;<br />
		&nbsp;&nbsp;"data": [<br />
		{#each dependency.outputs as component_id, component_index}
			&nbsp;&nbsp;&nbsp;&nbsp;{#if dependency_outputs[dependency_index][component_index] !== undefined}
				<input
					disabled
					class="bg-gray-100 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5 text-sm rounded ring-1 ring-gray-300 dark:ring-gray-500"
					type="text"
					bind:value={dependency_outputs[dependency_index][component_index]}
				/> :
			{/if}
			<span class="text-gray-500">
				{instance_map[component_id].documentation?.type},
			</span>
			<span class="text-gray-400"
				>// represents {instance_map[component_id].documentation?.description} of
				{((label) => {
					return label ? "'" + label + "'" : "the";
				})(instance_map[component_id].props.label)}

				<span class="capitalize">{instance_map[component_id].props.name}</span> component
			</span>
			<br />
		{/each}
		&nbsp;&nbsp;&nbsp;&nbsp;],<br />
		&nbsp;&nbsp;&nbsp;&nbsp;"duration": (float)
		<span class="text-gray-400">
			// number of seconds to run function call</span
		><br />
		&#125;
	</div>
	{#if is_running}
		<div class="self-center justify-self-center">
			<Loader margin={false} />
		</div>
	{/if}
</div>

<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
	import { Button } from "@gradio/button";

	export let dependency: Dependency;
	export let dependency_failures: boolean[][];
	export let dependency_index: number;
	export let instance_map: {
		[id: number]: ComponentMeta;
	};
	export let run: (id: number) => Promise<void>;
	export let dependency_inputs: string[][];
</script>

<h4 class="font-bold mt-6 mb-3 flex items-center">
	<div
		class="flex items-center h-1 w-3 bg-gray-300 dark:bg-gray-500 rounded-full mr-2"
	>
		<div class="rounded-full h-1.5 w-1.5 bg-gray-700 dark:bg-gray-400" />
	</div>
	Input Payload
</h4>
<div
	class="block bg-white border dark:bg-gray-800 p-4 font-mono text-sm rounded-lg"
>
	&#123;<br />
	&nbsp;&nbsp;"data": [<br />
	{#each dependency.inputs as component_id, component_index}
		&nbsp;&nbsp;&nbsp;&nbsp;<input
			class="bg-gray-100 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5 text-sm rounded ring-1 ring-gray-300 dark:ring-gray-500"
			type="text"
			bind:value={dependency_inputs[dependency_index][component_index]}
		/>
		{#if dependency_failures[dependency_index][component_index]}
			<span class="text-red-600">ERROR</span>
		{/if}
		<span class="text-gray-500">
			: {instance_map[component_id].documentation?.type},</span
		>
		<span class="text-gray-400"
			>// represents {instance_map[component_id].documentation?.description} of
			{((label) => {
				return label ? "'" + label + "'" : "the";
			})(instance_map[component_id].props.label)}

			<span class="capitalize">{instance_map[component_id].props.name}</span> component
		</span>
		<br />
	{/each}
	&nbsp;&nbsp;]<br />
	&#125;
</div>

<span class="space" />
<Button
	variant="primary"
	on:click={run.bind(null, dependency_index)}
	style={{ full_width: true }}
>
	Try It Out
</Button>

<style>
	.space {
		display: flex;
		flex-basis: 1;
		margin-top: var(--size-4);
	}

	/* .space: global(); */
</style>

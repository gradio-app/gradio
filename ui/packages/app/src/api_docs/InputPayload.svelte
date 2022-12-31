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
		class="toggle-icon flex items-center h-1 w-3 bg-gray-300 dark:bg-gray-500 rounded-full mr-2"
	>
		<div
			class="toggle-dot rounded-full h-1.5 w-1.5 bg-gray-700 dark:bg-gray-400"
		/>
	</div>
	Input Payload
</h4>
<div
	class="payload-details block bg-white border dark:bg-gray-800 p-4 font-mono text-sm rounded-lg"
>
	&#123;
	<br />
	&nbsp;&nbsp;"data": [
	<br />
	{#each dependency.inputs as component_id, component_index}
		&nbsp;&nbsp;&nbsp;&nbsp;
		<input
			class="bg-gray-100 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5 text-sm rounded ring-1 ring-gray-300 dark:ring-gray-500"
			type="text"
			bind:value={dependency_inputs[dependency_index][component_index]}
		/>
		{#if dependency_failures[dependency_index][component_index]}
			<span class="error text-red-600">ERROR</span>
		{/if}
		<span class="type text-gray-500">
			: {instance_map[component_id].documentation?.type},
		</span>
		<span class="desc text-gray-400">
			// represents {instance_map[component_id].documentation?.description} of
			{((label) => {
				return label ? "'" + label + "'" : "the";
			})(instance_map[component_id].props.label)}

			<span class="name capitalize">
				{instance_map[component_id].props.name}
			</span>
			component
		</span>
		<br />
	{/each}
	&nbsp;&nbsp;]
	<br />
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

	h4 {
		display: flex;
		align-items: center;
		margin-top: var(--size-6);
		margin-bottom: var(--size-3);
		font-weight: var(--weight-bold);
	}

	.toggle-icon {
		display: flex;
		align-items: center;
		margin-right: var(--size-2);
		border-radius: var(--radius-full);
		background: var(--color-grey-300);
		width: 12px;
		height: 4px;
	}

	.toggle-dot {
		border-radius: var(--radius-full);
		background: var(--color-grey-700);
		height: 6px;
	}

	:global(.dark) .toggle-icon {
		background: var(--color-grey-500);
	}

	:global(.dark) .toggle-dot {
		background: var(--color-grey-400);
	}

	.payload-details {
		/* p-4 font-mono text-sm rounded-lg */
		display: block;
		border: 1px solid var(--color-border-primary);
		background: var(--color-background-tertiary);
		padding: var(--size-4);
		font-family: var(--font-mono);
		/* font-size: ; */
	}

	input {
		/* bg-gray-100 dark:bg-gray-600 border-none w-40 px-1 py-0.5 my-0.5 text-sm rounded ring-1 ring-gray-300 dark:ring-gray-500 */
	}

	.error {
		/* text-red-600 */
	}

	.type {
		/* text-gray-500 */
	}

	.desc {
		/* text-gray-400 */
	}

	.name {
		/* capitalize */
		text-transform: capitalize;
	}
</style>

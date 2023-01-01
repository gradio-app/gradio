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

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot" />
	</div>
	Response Object
</h4>
<div class="response-wrap">
	<div class:hide={is_running}>
		&#123;
		<br />
		&nbsp;&nbsp;"data": [
		<br />
		{#each dependency.outputs as component_id, component_index}
			&nbsp;&nbsp;&nbsp;{#if dependency_outputs[dependency_index][component_index] !== undefined}
				<input
					disabled
					type="text"
					bind:value={dependency_outputs[dependency_index][component_index]}
				/>
				:
			{/if}
			<span class="type">
				{instance_map[component_id].documentation?.type},
			</span>
			<span class="desc">
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
		&nbsp;&nbsp;],
		<br />
		&nbsp;&nbsp;"duration": (float)
		<span class="desc">// number of seconds to run function call</span>
		<br />
		&#125;
	</div>
	{#if is_running}
		<div class="load-wrap">
			<Loader margin={false} />
		</div>
	{/if}
</div>

<style>
	.load-wrap {
		align-self: center;
		justify-self: center;
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
		margin-left: auto;
		border-radius: var(--radius-full);
		background: var(--color-grey-700);
		width: 6px;
		height: 6px;
	}

	.response-wrap {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--color-border-primary);
		border-radius: var(--radius-lg);
		background: var(--color-background-primary);
		padding: var(--size-4);
		font-size: var(--scale-00);
		font-family: var(--font-mono);
	}

	input {
		--ring-color: var(--color-border-primary);
		margin-top: var(--size-0-5);
		margin-bottom: var(--size-0-5);
		box-shadow: 0 0 0 1px var(--ring-color);
		border: none;
		border-radius: var(--radius-sm);
		background: var(--color-background-secondary);
		padding: var(--size-0-5) var(--size-1);
		width: var(--size-40);
		font-size: var(--scale-00);
	}

	.type {
		color: var(--color-text-label);
	}

	.desc {
		color: var(--color-text-subdued);
	}

	.name {
		text-transform: capitalize;
	}

	.hide {
		display: none;
	}
</style>

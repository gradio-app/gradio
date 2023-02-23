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
	
	export let root;

	const format_url = (desc, data) => desc.replaceAll("{ROOT}", root).replaceAll("{name}", data ? JSON.parse(`${data}`)?.name : "{name}");
	
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
		<div class="first-level">"data": [</div>
		<br />
		{#each dependency.outputs as component_id, component_index}
		<div class="second-level">{#if dependency_outputs[dependency_index][component_index] !== undefined}
				<input
					disabled
					type="text"
					bind:value={dependency_outputs[dependency_index][component_index]}
				/>
				:
			{/if}
			<span class="type">
				{instance_map[component_id].documentation?.type?.response_object ||
					instance_map[component_id].documentation?.type?.payload},
			</span>
			<span class="desc">
				// represents {format_url(instance_map[component_id].documentation?.description
					?.response_object ||
					instance_map[component_id].documentation?.description?.payload,
					dependency_outputs[dependency_index][component_index]
					)} of
				{((label) => {
					return label ? "'" + label + "'" : "the";
				})(instance_map[component_id].props.label)}
				<span class="name capitalize">
					{instance_map[component_id].props.name}
				</span>
				component
			</span>
		</div>
			<br />
		{/each}
		<div class="second-level">],</div>
		<br />
		<div class="first-level">"duration": (float)
		<span class="desc">// number of seconds to run function call</span></div>
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
		color: var(--color-text-body);
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
		background: var(--color-background-tertiary);
		padding: var(--size-4);
		color: var(--color-text-body);
		font-size: var(--scale-00);
		font-family: var(--font-mono);
	}

	input {
		--ring-color: transparent;
		margin-top: var(--size-0-5);
		margin-bottom: var(--size-0-5);
		box-shadow: 0 0 0 var(--shadow-spread) var(--ring-color);
		border: 1px solid var(--input-border-color-base);
		border-radius: var(--radius-sm);
		background: var(--input-background-base) !important;
		padding: var(--size-0-5) var(--size-1) !important;
		width: var(--size-40);
		font-size: var(--scale-000);
	}

	input:focus-visible {
		--ring-color: var(--color-focus-primary);
		outline: none;
	}

	input:focus {
		--ring-color: var(--color-focus-primary);
		border-color: var(--input-border-color-focus);
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

	.first-level {
		margin-left: 2rem;
	}

	.second-level {
		margin-left: 6rem;
	}

</style>

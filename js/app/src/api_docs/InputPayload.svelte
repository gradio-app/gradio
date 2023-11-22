<script lang="ts">
	import type { ComponentMeta, Dependency } from "../types";
	import { BaseButton } from "@gradio/button";
	import { Block } from "@gradio/atoms";

	export let dependency: Dependency;
	export let dependency_failures: boolean[][];
	export let dependency_index: number;
	export let instance_map: {
		[id: number]: ComponentMeta;
	};
	export let run: (id: number) => Promise<void>;
	export let dependency_inputs: string[][];

	function format_label(label: unknown): string {
		return label ? "'" + label + "'" : "the";
	}
</script>

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot" />
	</div>
	Input Payload
</h4>
<Block>
	<div class="payload-details">
		&#123;
		<div class="first-level">"data": [</div>
		{#each dependency.inputs as component_id, component_index}
			<div class="second-level">
				<input
					class=""
					type="text"
					bind:value={dependency_inputs[dependency_index][component_index]}
				/>
				{#if dependency_failures[dependency_index][component_index]}
					<span class="error">ERROR</span>
				{/if}

				<span class="type">
					: {instance_map[component_id].documentation?.type?.input_payload ||
						instance_map[component_id].documentation?.type?.payload},
				</span>
				<span class="desc">
					// represents {instance_map[component_id].documentation?.description
						?.input_payload ||
						instance_map[component_id].documentation?.description?.payload} of
					{format_label(instance_map[component_id].props.label)}
					<span class="name">
						{instance_map[component_id].props.name}
					</span>
					component
				</span>
			</div>
		{/each}
		<div class="first-level">]</div>
		&#125;
	</div>
</Block>

<span class="space" />
<BaseButton variant="primary" on:click={run.bind(null, dependency_index)}>
	Try It Out
</BaseButton>

<style>
	.payload-details {
		font-family: var(--font-mono);
	}

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
		color: var(--body-text-color);
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
		width: 6px;
		height: 6px;
	}

	:global(.dark) .toggle-icon {
		background: var(--color-grey-500);
	}

	:global(.dark) .toggle-dot {
		background: var(--color-grey-400);
	}

	input[type="text"] {
		--ring-color: transparent;
		margin: var(--size-1) 0;
		outline: none !important;
		box-shadow: var(--input-shadow);
		border: var(--input-border-width) solid var(--input-border-color);
		border-radius: var(--radius-lg);
		background: var(--input-background-fill);
		padding: var(--size-1-5);
		color: var(--body-text-color);
		font-weight: var(--input-text-weight);
		font-size: var(--input-text-size);
		line-height: var(--line-sm);
	}

	input:focus {
		box-shadow: var(--input-shadow-focus);
		border-color: var(--input-border-color-focus);
	}

	.error {
		color: var(--error-text-color);
	}

	.type {
		color: var(--block-label-text-color);
	}

	.desc {
		color: var(--body-text-color-subdued);
	}

	.name {
		text-transform: capitalize;
	}

	.first-level {
		margin-left: 1rem;
	}

	.second-level {
		margin-left: 2rem;
	}
</style>

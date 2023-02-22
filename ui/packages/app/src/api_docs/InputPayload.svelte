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

	function format_label(label: unknown) {
		return label ? "'" + label + "'" : "the";
	}
</script>

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot" />
	</div>
	Input Payload
</h4>
<div class="payload-details">
	&#123;
	<br />
	&nbsp;&nbsp;"data": [
	<br />
	{#each dependency.inputs as component_id, component_index}
		&nbsp;&nbsp;&nbsp;&nbsp;
		<input
			class=""
			type="text"
			bind:value={dependency_inputs[dependency_index][component_index]}
		/>
		{#if dependency_failures[dependency_index][component_index]}
			<span class="error">ERROR</span>
		{/if}

		<span class="type">
			: {instance_map[component_id].documentation?.type.input_payload ||
				instance_map[component_id].documentation?.type.payload},
		</span>
		<span class="desc">
			// represents {instance_map[component_id].documentation?.description
				.input_payload ||
				instance_map[component_id].documentation?.description.payload} of
			{format_label(instance_map[component_id].props.label)}
			<span class="name">
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

	.payload-details {
		display: block;
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

	.error {
		color: var(--color-functional-error-base);
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
</style>

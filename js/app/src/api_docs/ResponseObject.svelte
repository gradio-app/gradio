<script lang="ts">
	import type { ComponentMeta, Dependency } from "../components/types";
	import Loader from "../components/StatusTracker/Loader.svelte";
	import { Block } from "@gradio/atoms";

	export let dependency: Dependency;
	export let dependency_index: number;
	export let instance_map: {
		[id: number]: ComponentMeta;
	};

	export let dependency_outputs: any[][];

	export let is_running: boolean;

	export let root: string;

	const format_url = (desc: string | undefined, data: string | undefined) =>
		desc
			?.replace("{ROOT}", root)
			?.replace("{name}", data ? JSON.parse(`${data}`)?.name : "{name}");
</script>

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot" />
	</div>
	Response Object
</h4>
<Block>
	<div class="response-wrap">
		<div class:hide={is_running}>
			{#each dependency.outputs as component_id, component_index}
				<div>
					{#if dependency_outputs[dependency_index][component_index] !== undefined}
						<input
							disabled
							type="text"
							bind:value={dependency_outputs[dependency_index][component_index]}
						/>
					{/if}
					<span class="desc">
						# Type: _type. Represents _description of _label _name component.
					</span>
				</div>
			{/each}
		</div>
		{#if is_running}
			<div class="load-wrap">
				<Loader margin={false} />
			</div>
		{/if}
	</div>
</Block>

<style>
	.load-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
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
		margin-left: auto;
		border-radius: var(--radius-full);
		background: var(--color-grey-700);
		width: 6px;
		height: 6px;
	}

	.response-wrap {
		font-family: var(--font-mono);
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
		box-shadow: var(--input-shadow);
		border-color: var(--input-border-color-focus);
	}

	input:disabled {
		background: var(--color-accent-soft);
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

	.hide {
		display: none;
	}

	.first-level {
		margin-left: 1rem;
	}

	.second-level {
		margin-left: 2rem;
	}
</style>

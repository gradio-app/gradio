<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";

	export let row: boolean;
	export let is_container: boolean;
	export let component_type: string;
	export let var_name: string;
	export let active = false;
	export let function_mode = false;
	export let event_list: string[];
	export let is_input = false;
	export let is_output = false;
	export let triggers: string[] = [];
	$: is_function = component_type === "function";

	export let gradio: Gradio<{
		select: SelectData;
	}>;

	const dispatch = (type: string) => {
		return (event: MouseEvent) => {
			event.stopPropagation();
			gradio.dispatch("select", { index: 0, value: type });
		};
	};

	const invisible_components = ["state", "browserstate", "function"];
</script>

<div class="sketchbox" class:function_mode class:row class:active>
	<div class="cover"></div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="interaction"
		on:click={is_container ? undefined : dispatch("modify")}
	>
		{#if invisible_components.includes(component_type)}
			<div class="component-name">
				<span>{component_type}:</span>&nbsp;{var_name}
			</div>
		{/if}
		{#if function_mode}
			{#if !is_function && !is_container}
				<div class="button-set">
					<button
						class="function input"
						on:click={dispatch("input")}
						class:selected={is_input}>input</button
					>
					<button
						class="function output"
						on:click={dispatch("output")}
						class:selected={is_output}>output</button
					>
					| {#each event_list as event}
						<button
							class="function event"
							on:click={dispatch("on:" + event)}
							class:selected={triggers.includes(event)}>on:{event}</button
						>
					{/each}
				</div>
			{/if}
		{:else}
			<button class="add up" on:click={dispatch("up")}>+</button>
			<button class="add left" on:click={dispatch("left")}>+</button>
			<button class="add right" on:click={dispatch("right")}>+</button>
			<button class="add down" on:click={dispatch("down")}>+</button>
			{#if !is_container}
				<button class="action modify" on:click={dispatch("modify")}>✎</button>
				<button class="action delete" on:click={dispatch("delete")}>✗</button>
			{/if}
		{/if}
	</div>
	<slot />
</div>

<style>
	.sketchbox {
		position: inherit;
		display: flex;
		flex-direction: inherit;
		align-items: inherit;
		min-height: 32px;
	}
	.sketchbox:not(.function_mode) {
		cursor: pointer;
	}
	.function_mode .cover {
		background-color: color-mix(
			in srgb,
			var(--background-fill-primary),
			transparent 80%
		);
	}

	.row > :global(*),
	.row > :global(.form),
	.row > :global(.form > *) {
		flex-grow: 1 !important;
	}
	.interaction {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 100;
	}
	.cover {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 99;
	}
	.interaction:hover,
	.active .interaction {
		border-color: var(--body-text-color);
		border-width: 1px;
		border-radius: var(--block-radius);
	}
	.active.function_mode .interaction {
		border-color: var(--color-accent);
		border-width: 2px;
	}
	.interaction:hover .add,
	.interaction:hover .action {
		display: flex;
	}
	button {
		border-color: var(--body-text-color);
		border-width: 1px;
		background-color: var(--button-secondary-background-fill);
		justify-content: center;
		align-items: center;
		font-weight: bold;
	}
	.add,
	.action {
		display: none;
		position: absolute;
	}
	.action {
		border-radius: 15px;
		width: 30px;
		height: 30px;
	}
	.add {
		border-radius: 10px;
		width: 20px;
		height: 20px;
	}
	.function {
		border-radius: 15px;
		padding: 4px 8px;
		font-size: 10px;
	}
	.function.selected {
		color: white;
	}
	.input.selected {
		background-color: oklch(0.707 0.165 254.624);
		border-color: oklch(0.707 0.165 254.624);
	}
	.output.selected {
		background-color: oklch(0.712 0.194 13.428);
		border-color: oklch(0.712 0.194 13.428);
	}
	.event.selected {
		background-color: oklch(0.702 0.183 293.541);
		border-color: oklch(0.702 0.183 293.541);
	}
	button:hover {
		background-color: var(--button-secondary-background-fill-hover);
	}
	.up {
		top: -10px;
		left: 50%;
		transform: translate(-50%, 0);
		width: 80%;
	}
	.left {
		top: 50%;
		left: -10px;
		transform: translate(0, -50%);
		height: 80%;
	}
	.right {
		top: 50%;
		right: -10px;
		transform: translate(0, -50%);
		height: 80%;
	}
	.down {
		bottom: -10px;
		left: 50%;
		transform: translate(-50%, 0);
		width: 80%;
	}
	.modify {
		top: 50%;
		left: 50%;
		transform: translate(calc(-50% - 20px), -50%);
	}
	.delete {
		top: 50%;
		left: 50%;
		transform: translate(calc(-50% + 20px), -50%);
	}
	.button-set {
		display: flex;
		gap: 8px;
		justify-content: center;
		align-items: center;
		height: 100%;
		flex-wrap: wrap;
		padding: 0 30px;
	}
	.component-name {
		background: var(--block-background-fill);
		border: var(--block-border-color) var(--block-border-width) solid;
		border-radius: var(--block-radius);
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.component-name span {
		color: var(--body-text-color-subdued);
		font-style: italic;
	}
</style>

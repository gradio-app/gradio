<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";

	export let row: boolean;
	export let is_container: boolean;
	export let component_type: string;
	export let var_name: string;
	export let active = false;

	export let gradio: Gradio<{
		select: SelectData;
	}>;

	const dispatch = (type: string) => {
		return () => gradio.dispatch("select", { index: 0, value: type });
	};

	const invisible_components = ["state"];
</script>

<div class="sketchbox" class:row class:active>
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
		<button class="add up" on:click={dispatch("up")}>+</button>
		<button class="add left" on:click={dispatch("left")}>+</button>
		<button class="add right" on:click={dispatch("right")}>+</button>
		<button class="add down" on:click={dispatch("down")}>+</button>
		{#if !is_container}
			<button class="action modify" on:click={dispatch("modify")}>✎</button>
			<button class="action delete" on:click={dispatch("delete")}>✗</button>
		{/if}
	</div>
	<slot />
</div>

<style>
	.sketchbox {
		cursor: pointer;
		position: inherit;
		display: flex;
		flex-direction: inherit;
		align-items: inherit;
		min-height: 32px;
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
	.interaction:hover,
	.active .interaction {
		border-color: var(--body-text-color);
		border-width: 1px;
		border-radius: var(--block-radius);
	}
	.interaction:hover button {
		display: flex;
	}
	button {
		border-color: var(--body-text-color);
		border-width: 1px;
		position: absolute;
		background-color: var(--button-secondary-background-fill);
		justify-content: center;
		align-items: center;
		font-weight: bold;
		display: none;
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

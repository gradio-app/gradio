<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";

	export let row: boolean;
	export let is_container: boolean;
	export let component_type: string;
	export let var_name: string;

	export let gradio:
		| Gradio<{
			select: SelectData;
		}>;

	const dispatch = (type: string) => {
		return () => gradio.dispatch("select", {index: 0, value: type});
	};

	const invisible_components = ["state"];
</script>

<div class="sketchbox" class:row>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="interaction" on:click={is_container ? undefined : dispatch("modify")}>
		{#if invisible_components.includes(component_type)}
			<div class="component-name"><span>{component_type}:</span>&nbsp;{var_name}</div>
		{/if}
		<button class="up" on:click={dispatch("up")}>+</button>
		<button class="left" on:click={dispatch("left")}>+</button>
		<button class="right" on:click={dispatch("right")}>+</button>
		<button class="down" on:click={dispatch("down")}>+</button>
		{#if !is_container}
			<button class="modify" on:click={dispatch("modify")}>✎</button>
			<button class="delete" on:click={dispatch("delete")}>✗</button>
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
	.interaction:hover {
		border-color: var(--body-text-color);
		border-width: 1px;		
	}
	.interaction:hover button {
		display: flex;
	}
	button {
		border-color: var(--body-text-color);
		border-width: 1px;		
		position: absolute;
		background-color: var(--button-secondary-background-fill);
		border-radius: 50%;
		width: 30px;
		height: 30px;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		display: none;
	}
	button:hover {
		background-color: var(--button-secondary-background-fill-hover);
	}
	.up {
		top: -15px;
		left: 50%;
		transform: translate(-50%, 0);
	}
	.left {
		top: 50%;
		left: -15px;
		transform: translate(0, -50%);
	}
	.right {
		top: 50%;
		right: -15px;
		transform: translate(0, -50%);
	}
	.down {
		bottom: -15px;
		left: 50%;
		transform: translate(-50%, 0);
	}
	.modify {
		top: 50%;
		left: 50%;
		transform: translate(calc(-50% - 30px), -50%);
	}
	.delete {
		top: 50%;
		left: 50%;
		transform: translate(calc(-50% + 30px), -50%);
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

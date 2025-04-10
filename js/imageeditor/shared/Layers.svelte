<script lang="ts">
	import { click_outside } from "./utils/events";
	import {
		Layers,
		Clear,
		ArrowUp,
		ArrowDown,
		Plus,
		Visibility,
		VisibilityOff
	} from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";
	import { createEventDispatcher } from "svelte";
	import type { Writable } from "svelte/store";

	const dispatch = createEventDispatcher<{
		new_layer: void;
		change_layer: string;
		move_layer: { id: string; direction: "up" | "down" };
		delete_layer: string;
		toggle_layer_visibility: string;
	}>();

	export let layers: Writable<{
		active_layer: string;
		layers: {
			name: string;
			id: string;
			user_created: boolean;
			visible: boolean;
		}[];
	}>;
	export let enable_additional_layers = true;
	export let enable_layers = true;
	export let show_layers = false;

	function new_layer(): void {
		dispatch("new_layer");
	}

	function change_layer(id: string): void {
		dispatch("change_layer", id);
		show_layers = false;
	}

	function move_layer(id: string, direction: "up" | "down"): void {
		dispatch("move_layer", { id, direction });
	}

	function delete_layer(id: string): void {
		dispatch("delete_layer", id);
	}
</script>

{#if enable_layers}
	<div
		class="layer-wrap"
		class:closed={!show_layers}
		use:click_outside={() => (show_layers = false)}
	>
		<button
			class="layer-title-button"
			aria-label="Show Layers"
			on:click|stopPropagation={() => (show_layers = !show_layers)}
		>
			{show_layers
				? "Layers"
				: $layers.layers.find((l) => l.id === $layers.active_layer)?.name}
			<span class="icon"><Layers /></span>
		</button>
		{#if show_layers}
			<ul>
				{#each $layers.layers as { id, name, user_created, visible }, i (i)}
					<li>
						{#if !visible}
							<IconButton
								Icon={VisibilityOff}
								size="small"
								on:click={(e) => {
									e.stopPropagation();
									dispatch("toggle_layer_visibility", id);
								}}
							/>
						{:else}
							<IconButton
								Icon={Visibility}
								size="small"
								on:click={(e) => {
									e.stopPropagation();
									dispatch("toggle_layer_visibility", id);
								}}
							/>
						{/if}
						<button
							class:selected_layer={$layers.active_layer === id}
							aria-label={`layer-${i + 1}`}
							on:click|stopPropagation={() => change_layer(id)}>{name}</button
						>
						{#if $layers.layers.length > 1}
							<div>
								{#if i > 0}
									<IconButton
										on:click={(e) => {
											e.stopPropagation();
											move_layer(id, "up");
										}}
										Icon={ArrowUp}
										size="x-small"
									/>
								{/if}
								{#if i < $layers.layers.length - 1}
									<IconButton
										on:click={(e) => {
											e.stopPropagation();
											move_layer(id, "down");
										}}
										Icon={ArrowDown}
										size="x-small"
									/>
								{/if}
								{#if $layers.layers.length > 1 && user_created}
									<IconButton
										on:click={(e) => {
											e.stopPropagation();
											delete_layer(id);
										}}
										Icon={Clear}
										size="x-small"
									/>
								{/if}
							</div>
						{/if}
					</li>
				{/each}
				{#if enable_additional_layers}
					<li class="add-layer">
						<IconButton
							Icon={Plus}
							label="Add Layer"
							on:click={(e) => {
								e.stopPropagation();
								new_layer();
							}}
							size="x-small"
						/>
					</li>
				{/if}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.add-layer {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: var(--spacing-sm) 0 0 0;
	}

	.add-layer :global(button) {
		width: 100%;
	}
	.icon {
		width: 14px;
		color: var(--body-text-color);
		transition: color 0.15s ease;
	}

	.layer-wrap {
		/* position: absolute; */
		display: flex;
		justify-content: center;
		align-items: center;
		/* border: 1px solid var(--border-color-primary); */
		/* z-index: var(--layer-1); */
		/* border-radius: var(--radius-sm); */
		/* background-color: var(--block-background-fill); */
		width: 100%;
		flex-direction: column;
		/* bottom: 5px; */
		/* right: 5px; */
		/* border-bottom: 0;
		border-right: 0; */
		/* box-shadow: var(--shadow-drop); */
	}

	.layer-wrap button {
		justify-content: space-between;
		align-items: center;
		width: 100%;
		display: flex;
		font-size: var(--text-sm);
		line-height: var(--line-sm);
		transition: all 0.15s ease;
		padding: var(--spacing-md) var(--spacing-lg);
		/* padding-right: var(--spacing-lg); */
		border-radius: var(--radius-sm);
		/* padding-left: 30px; */
	}

	button.layer-title-button {
		width: 100%;
		/* padding-left: 30px; */
	}

	.layer-wrap button:hover .icon {
		color: var(--color-accent);
	}

	.selected_layer {
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
	}

	ul {
		/* position: absolute; */
		bottom: 0;
		right: 0;
		/* background: var(--block-background-fill); */
		width: 100%;
		/* min-width: 100%; */
		list-style: none;
		z-index: var(--layer-top);
		/* border: 1px solid var(--border-color-primary); */
		/* border-radius: var(--radius-sm); */
		/* box-shadow: var(--shadow-drop-lg); */
		padding: var(--spacing-sm);
		/* transform: translate(-1px, 1px); */
		border-top: 1px solid var(--border-color-primary);
	}

	/* .sep {
		height: 12px;
		background-color: var(--block-border-color);
		width: 1px;
		display: block;
		margin-left: var(--spacing-xl);
	} */

	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* border-radius: var(--radius-sm); */
		transition: background-color 0.15s ease;
		border-bottom: 1px solid var(--border-color-primary);
	}

	.layer-wrap ul > li > button {
		padding-left: calc(var(--spacing-md));
	}

	li:hover {
		background-color: var(--background-fill-secondary);
	}

	li:last-child {
		border-bottom: none;
	}
	li:last-child:hover {
		background-color: unset;
	}

	li div {
		display: flex;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
	}
	li > button {
		padding: var(--spacing-sm) var(--spacing-md);
	}

	/* li > div > button {
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	li > div > button:hover {
		opacity: 1;
	} */
</style>

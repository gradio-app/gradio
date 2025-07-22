<script lang="ts">
	import { Client } from "@gradio/client";

	export let app: Client;
	export let root: string;
	let show_buttons = true;
	let show_editor = false;
	let prompt = "";

	const submit = () => {
		const post = app.post_data(`${root}/gradio_api/vibe-edit/`, {
            "prompt": prompt,
        })
        prompt = "Working..."
        post.then((response) => {
            prompt = "";
        })
	};
</script>

<div class="vibe-editor">
	{#if show_buttons}
		<button
			class="ai"
			on:click={() => {
				show_buttons = false;
				show_editor = true;
			}}>✨</button
		>
		<button
			class="no-ai"
			on:click={() => {
				show_buttons = false;
			}}>✗</button
		>
	{/if}
	{#if show_editor}
		<textarea
			on:keydown={(e) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					submit();
				}
			}}
			autofocus
			bind:value={prompt}
			placeholder="What can I add or change?"
		/>
	{/if}
</div>

<style>
	.vibe-editor {
		position: absolute;
		left: 0;
		bottom: 40px;
		width: 100%;
		height: 80px;
		display: flex;
		justify-content: center;
		z-index: 100;
	}
	button {
		filter: grayscale(100%);
		background: var(--background-fill-secondary);
		display: flex;
		height: 32px;
		width: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 100%;
		border: solid 1px var(--border-color-primary);
		box-shadow: var(--shadow-drop-lg);
		margin: 8px;
	}
	textarea {
		width: 100%;
		box-shadow: var(--shadow-drop-lg);
		max-width: 400px;
		background: var(--input-background-fill);
		border-radius: var(--input-radius);
		resize: none;
		outline: none;
	}
</style>

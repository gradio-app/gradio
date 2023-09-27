<script lang="ts">
	import { onDestroy } from "svelte";
	import { Like } from "@gradio/icons";
	import { Dislike } from "@gradio/icons";

	export let action: "like" | "dislike";
	export let handle_action: () => void;

	let actioned = false;
	let Icon = action === "like" ? Like : Dislike;

	let timer: NodeJS.Timeout;

	function action_feedback(): void {
		actioned = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			actioned = false;
		}, 2000);
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<button
	on:click={() => {
		action_feedback();
		handle_action();
	}}
	on:keydown={(e) => {
		if (e.key === "Enter") {
			action_feedback();
			handle_action();
		}
	}}
	title={action + " message"}
	aria-label={actioned ? `clicked ${action}` : action}
>
	<Icon />
</button>

<style>
	button {
		position: relative;
		top: 0;
		right: 0;
		cursor: pointer;
		color: var(--body-text-color-subdued);
		width: 17px;
		height: 17px;
		margin-right: 5px;
	}

	button:hover,
	button:focus {
		color: var(--body-text-color);
	}
</style>

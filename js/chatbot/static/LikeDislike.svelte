<script lang="ts">
	import { Like } from "@gradio/icons";
	import { Dislike } from "@gradio/icons";

	export let action: "like" | "dislike";
	export let handle_action: () => void;

	let actioned = false;
	let Icon = action === "like" ? Like : Dislike;

	function action_feedback(): void {
		actioned = true;
	}
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
	<Icon {actioned} />
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

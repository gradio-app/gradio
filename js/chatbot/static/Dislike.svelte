<script lang="ts">
	import { onDestroy } from "svelte";
	import { Dislike } from "@gradio/icons";

	let disliked = false;
	let timer: NodeJS.Timeout;

	export let handle_dislike: () => void;

	function dislike_feedback(): void {
		disliked = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			disliked = false;
		}, 2000);
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<button
	on:click={() => {
		dislike_feedback();
		handle_dislike();
	}}
	class="action"
	title="like"
	aria-roledescription={disliked ? "Message disliked" : "Dislike message"}
	aria-label={disliked ? "Disliked" : "Dislke"}
>
	<Dislike />
</button>

<style>
	button {
		position: relative;
		top: 0;
		right: 0;
		cursor: pointer;
		width: 17px;
		height: 17px;
		color: var(--body-text-color-subdued);
		margin-left: 5px;
	}

	button:hover,
	button:focus {
		color: var(--body-text-color);
	}
</style>

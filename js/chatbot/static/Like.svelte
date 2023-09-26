<script lang="ts">
	import { onDestroy } from "svelte";
	import { Like } from "@gradio/icons";

	let liked = false;
	let timer: NodeJS.Timeout;

	export let handle_like: () => void;

	function like_feedback(): void {
		liked = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			liked = false;
		}, 2000);
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<button
	on:click={() => {
		like_feedback();
		handle_like();
	}}
	title="like"
	aria-roledescription={liked ? "Message liked" : "Like message"}
	aria-label={liked ? "Liked" : "Like"}
>
	<Like />
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
		margin-left: 5px;
	}

	button:hover,
	button:focus {
		color: var(--body-text-color);
	}
</style>

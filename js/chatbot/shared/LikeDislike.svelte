<script lang="ts">
	import { Like } from "@gradio/icons";
	import { Dislike } from "@gradio/icons";
	import ThumbDownIcon from "./ThumbDownIcon.svelte";
	import ThumbUpIcon from "./ThumbUpIcon.svelte";

	export let handle_action: (selected: string | null) => void;
	export let padded = false;

	let selected: "like" | "dislike" | null = null;
</script>

<button
	on:click={() => {
		selected = "dislike";
		handle_action(selected);
	}}
	aria-label={selected === "dislike" ? "clicked dislike" : "dislike"}
	class:padded
	class:selected={selected === "dislike"}
>
	<span>
		<ThumbDownIcon />
	</span>
</button>

<button
	class="like-button"
	class:padded
	on:click={() => {
		selected = "like";
		handle_action(selected);
	}}
	aria-label={selected === "like" ? "clicked like" : "like"}
	class:selected={selected === "like"}
>
	<span>
		<ThumbUpIcon />
	</span>
</button>

<style>
	button {
		cursor: pointer;
		color: var(--body-text-color-subdued);
		display: flex;
		align-items: center;
		justify-content: center;
		/* transform: translateX(-10px); */
	}

	span {
		display: inline-block;
		width: 15px;
		height: 15px;
	}

	button:hover,
	button:focus {
		color: var(--body-text-color);
	}

	.selected,
	.selected:focus,
	.selected:hover {
		color: var(--color-accent);
	}
</style>

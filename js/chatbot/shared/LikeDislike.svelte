<script lang="ts">
	import { Like } from "@gradio/icons";
	import { Dislike } from "@gradio/icons";

	export let handle_action: (selected: string | null) => void;

	let selected: "like" | "dislike" | null = null;
</script>

<button
	on:click={() => {
		selected = "like";
		handle_action(selected);
	}}
	aria-label={selected === "like" ? "clicked like" : "like"}
>
	<Like selected={selected === "like"} />
</button>

<button
	on:click={() => {
		selected = "dislike";
		handle_action(selected);
	}}
	aria-label={selected === "dislike" ? "clicked dislike" : "dislike"}
>
	<Dislike selected={selected === "dislike"} />
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

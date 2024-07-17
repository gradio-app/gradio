<script lang="ts">
	import ThumbDownActive from "./ThumbDownActive.svelte";
	import ThumbDownDefault from "./ThumbDownDefault.svelte";
	import ThumbUpActive from "./ThumbUpActive.svelte";
	import ThumbUpDefault from "./ThumbUpDefault.svelte";

	export let handle_action: (selected: string | null) => void;
	export let padded = false;
	export let position: "right" | "left" = "left";

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
	class="dislike-button {position}"
>
	{#if selected === "dislike"}
		<ThumbDownActive />
	{:else}
		<ThumbDownDefault />
	{/if}
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
	{#if selected === "like"}
		<ThumbUpActive />
	{:else}
		<ThumbUpDefault />
	{/if}
</button>

<style>
	button {
		cursor: pointer;
		color: var(--body-text-color-subdued);
		display: flex;
		align-items: center;
		justify-content: center;
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

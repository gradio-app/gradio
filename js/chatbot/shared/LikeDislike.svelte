<script lang="ts">
	import ThumbDownActive from "./ThumbDownActive.svelte";
	import ThumbDownDefault from "./ThumbDownDefault.svelte";
	import ThumbUpActive from "./ThumbUpActive.svelte";
	import ThumbUpDefault from "./ThumbUpDefault.svelte";

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
	class="dislike-button"
>
	<span>
		{#if selected === "dislike"}
			<ThumbDownActive />
		{:else}
			<ThumbDownDefault />
		{/if}
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
		{#if selected === "like"}
			<ThumbUpActive />
		{:else}
			<ThumbUpDefault />
		{/if}
	</span>
</button>

<style>
	button {
		cursor: pointer;
		color: var(--body-text-color-subdued);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 7px !important;
	}

	span {
		display: inline-block;
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

	.like-button {
		transform: translateY(0px);
	}
</style>

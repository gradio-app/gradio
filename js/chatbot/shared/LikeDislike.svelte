<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import ThumbDownActive from "./ThumbDownActive.svelte";
	import ThumbDownDefault from "./ThumbDownDefault.svelte";
	import ThumbUpActive from "./ThumbUpActive.svelte";
	import ThumbUpDefault from "./ThumbUpDefault.svelte";

	export let handle_action: (selected: string | null) => void;

	let selected: "like" | "dislike" | null = null;
</script>

<IconButton
	Icon={selected === "dislike" ? ThumbDownActive : ThumbDownDefault}
	label={selected === "dislike" ? "clicked dislike" : "dislike"}
	color={selected === "dislike"
		? "var(--color-accent)"
		: "var(--block-label-text-color)"}
	on:click={() => {
		selected = "dislike";
		handle_action(selected);
	}}
/>

<IconButton
	Icon={selected === "like" ? ThumbUpActive : ThumbUpDefault}
	label={selected === "like" ? "clicked like" : "like"}
	color={selected === "like"
		? "var(--color-accent)"
		: "var(--block-label-text-color)"}
	on:click={() => {
		selected = "like";
		handle_action(selected);
	}}
/>

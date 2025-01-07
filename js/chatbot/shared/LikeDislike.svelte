<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import ThumbDownActive from "./ThumbDownActive.svelte";
	import ThumbDownDefault from "./ThumbDownDefault.svelte";
	import ThumbUpActive from "./ThumbUpActive.svelte";
	import ThumbUpDefault from "./ThumbUpDefault.svelte";
	import Flag from "./Flag.svelte";
	import FlagActive from "./FlagActive.svelte";

	export let handle_action: (selected: string | null) => void;
	export let feedback_options: string[];
	$: extra_feedback = feedback_options.filter(
		(option) => option !== "Like" && option !== "Dislike"
	);

	let selected: string | null = null;
</script>

{#if feedback_options.includes("Like") || feedback_options.includes("Dislike")}
	{#if feedback_options.includes("Dislike")}
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
	{/if}
	{#if feedback_options.includes("Like")}
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
	{/if}
{/if}

{#if extra_feedback.length > 0}
	<div class="extra-feedback">
		<IconButton
			Icon={selected && extra_feedback.includes(selected) ? FlagActive : Flag}
			label="Feedback"
			color={selected && extra_feedback.includes(selected)
				? "var(--color-accent)"
				: "var(--block-label-text-color)"}
		/>
		<div class="extra-feedback-options">
			{#each extra_feedback as option}
				<button
					class="extra-feedback-option"
					style:font-weight={selected === option ? "bold" : "normal"}
					on:click={() => {
						selected = option;
						handle_action("feedback:" + selected);
					}}>{option}</button
				>
			{/each}
		</div>
	</div>
{/if}

<style>
	.extra-feedback {
		display: flex;
		align-items: center;
		position: relative;
	}
	.extra-feedback-options {
		display: none;
		position: absolute;
		padding: var(--spacing-md) 0;
		flex-direction: column;
		gap: var(--spacing-sm);
		top: 100%;
	}
	.extra-feedback:hover .extra-feedback-options {
		display: flex;
	}
	.extra-feedback-option {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		color: var(--block-label-text-color);
		background-color: var(--block-background-fill);
		font-size: var(--text-xs);
		padding: var(--spacing-xxs) var(--spacing-sm);
		width: max-content;
	}
</style>

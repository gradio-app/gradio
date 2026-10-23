<script lang="ts">
	import { Microphone, Webcam } from "@gradio/icons";

	let {
		kind = "webcam",
		disabled = false,
		onclick
	}: {
		kind?: "webcam" | "microphone";
		disabled?: boolean;
		onclick?: () => void;
	} = $props();
</script>

<button style:height="100%" {disabled} {onclick}>
	<div class="wrap">
		<span class="icon-wrap">
			{#if kind === "microphone"}
				<Microphone />
			{:else}
				<Webcam />
			{/if}
		</span>
		{kind === "microphone"
			? "Click to Access Microphone"
			: "Click to Access Webcam"}
	</div>
</button>

<style>
	button {
		cursor: pointer;
		width: var(--size-full);
	}

	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: var(--size-60);
		color: var(--block-label-text-color);
		height: 100%;
		padding-top: var(--size-3);
	}

	.icon-wrap {
		width: 30px;
		margin-bottom: var(--spacing-lg);
	}

	@media (--screen-md) {
		.wrap {
			font-size: var(--text-lg);
		}
	}
</style>

<script lang="ts">
	interface Props {
		time_limit: number | null;
	}

	let { time_limit }: Props = $props();

	// A stream that runs out of time while nobody waits goes on, and its time
	// limit counts again from where it ran out, so the bar starts over for as
	// long as the stream is shown.
	let period = $state(0);
</script>

{#if time_limit}
	{#key period}
		<div
			class="streaming-bar"
			style:animation-duration="{time_limit}s"
			onanimationend={() => (period += 1)}
		></div>
	{/key}
{/if}

<style>
	.streaming-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 4px;
		background-color: var(--primary-600);
		animation: countdown linear forwards;
		z-index: 1;
	}

	@keyframes countdown {
		from {
			transform: translateX(0%);
		}
		to {
			transform: translateX(-100%);
		}
	}
</style>

<script lang="ts">
	export let time_limit: number | null;
</script>

{#if time_limit}
	<div class="streaming-bar" style:animation-duration="{time_limit}s"></div>
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

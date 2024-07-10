<script lang="ts">
	let expanded = false;
	export let title: string;

	function toggleExpanded(): void {
		expanded = !expanded;
	}
</script>

<button class="box" on:click={toggleExpanded}>
	<div class="title">
		<span class="title-text">{title}</span>
		<span
			style:transform={expanded ? "rotate(0)" : "rotate(90deg)"}
			class="arrow"
		>
			▼
		</span>
	</div>
	{#if expanded}
		<div class="content">
			<slot></slot>
		</div>
	{/if}
</button>

<style>
	.box {
		border-radius: 4px;
		cursor: pointer;
		max-width: max-content;
		background: var(--color-accent-soft);
	}

	.title {
		display: flex;
		align-items: center;
		padding: 8px;
		color: var(--body-text-color);
		opacity: 0.8;
	}

	.content {
		padding: 8px;
	}

	.title-text {
		padding-right: var(--spacing-lg);
	}

	.arrow {
		margin-left: auto;
		opacity: 0.8;
	}
</style>

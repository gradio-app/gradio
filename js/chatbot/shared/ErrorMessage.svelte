<script lang="ts">
	let expanded = false;

	function toggleExpanded(): void {
		expanded = !expanded;
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="box" on:click={toggleExpanded}>
	<div class="title">
		<div class="icon">💥</div>
		<span>{"Error"}</span>
	</div>
	{#if expanded}
		<div class="content">
			<slot></slot>
		</div>
	{/if}
</div>

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
		color: var(--color-red-50);
	}

	.icon {
		width: 18px;
		height: 18px;
		margin-right: 8px;
	}

	.content {
		padding: 8px;
	}
</style>

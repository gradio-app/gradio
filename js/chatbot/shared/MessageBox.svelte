<script lang="ts">
	export let expanded = false;
	export let title: string;
	export let rtl = false;

	function toggleExpanded(): void {
		expanded = !expanded;
	}
</script>

<div style:padding="var(--spacing-sm) var(--spacing-xl)">
	<div class="box" style:text-align={rtl ? "right" : "left"}>
		<div
			class="title"
			on:click|stopPropagation={toggleExpanded}
			role="button"
			tabindex="0"
			on:keydown={(e) => e.key === "Enter" && toggleExpanded()}
		>
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
	</div>
</div>

<style>
	.box {
		border-radius: 4px;
		max-width: max-content;
		background: var(--color-accent-soft);
		border: 1px solid var(--border-color-accent-subdued);
		font-size: 0.8em;
	}

	.title {
		display: flex;
		align-items: center;
		padding: 3px 6px;
		color: var(--body-text-color);
		opacity: 0.8;
		cursor: pointer;
	}

	.content {
		padding: 4px 8px;
	}

	.content :global(*) {
		font-size: 0.8em;
	}

	.title-text {
		padding-right: var(--spacing-lg);
	}

	.arrow {
		margin-left: auto;
		opacity: 0.8;
	}
</style>

<script lang="ts">
	export let shortcuts = [] as any[];
</script>

<div class="mb-4 shortcut-card">
	<div class="shortcut-header">
		<span class="shortcut-title">Shortcuts</span>
	</div>
	<div class="shortcut-content">
		{#each shortcuts as shortcut}
			<details class="shortcut-item">
				<summary class="shortcut-row">
					<pre class="shortcut-code"><code>gradio.{shortcut[0]}</code></pre>
				</summary>
				<div class="shortcut-details">
					<div class="shortcut-field">
						<span class="field-label">Interface String Shortcut</span>
						<code>"{shortcut[1]}"</code>
					</div>
					<div class="shortcut-field">
						<span class="field-label">Initialization</span>
						<span class="field-value">{shortcut[2]}</span>
					</div>
				</div>
			</details>
		{/each}
	</div>
</div>

<style>
	.shortcut-card {
		border-radius: var(--block-radius);
		overflow: hidden;
		border: var(--block-border-width) solid var(--table-border-color);
		background: var(--block-background-fill);
	}

	.shortcut-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-xl) var(--spacing-xxl);
		border-bottom: var(--block-border-width) solid var(--table-border-color);
		background: var(--block-background-fill);
	}

	.shortcut-title {
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--body-text-color);
	}

	.shortcut-content {
		overflow-y: auto;
	}

	.shortcut-item {
		border-bottom: var(--block-border-width) solid var(--table-border-color);
	}

	.shortcut-item:last-child {
		border-bottom: none;
	}

	.shortcut-row {
		position: relative;
		padding: var(--spacing-xl) var(--spacing-xxl);
		padding-right: 2.5rem;
		background: var(--table-odd-background-fill);
		border-bottom: 0px solid var(--table-border-color);
		list-style: none;
		cursor: pointer;
	}

	.shortcut-row::-webkit-details-marker {
		display: none;
	}

	.shortcut-row::after {
		content: "▼";
		position: absolute;
		top: 50%;
		right: var(--spacing-xxl);
		transform: translateY(-50%);
		transition: transform 0.3s ease;
		font-size: var(--text-xs);
		opacity: 0.7;
		color: var(--body-text-color);
	}

	details[open] .shortcut-row::after {
		transform: translateY(-50%) rotate(180deg);
	}

	details[open] .shortcut-row {
		border-bottom-width: var(--block-border-width);
	}

	.shortcut-code {
		margin: 0;
		background: transparent;
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}

	.shortcut-code code {
		background: none;
		font-family: var(--font-mono);
		color: var(--body-text-color);
	}

	.shortcut-details {
		padding: var(--spacing-xl) var(--spacing-xxl);
		background: var(--block-background-fill);
		color: var(--body-text-color);
	}

	.shortcut-field {
		margin-bottom: var(--spacing-lg);
	}

	.shortcut-field:last-child {
		margin-bottom: 0;
	}

	.field-label {
		display: block;
		text-transform: uppercase;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--body-text-color-subdued);
		margin-bottom: var(--spacing-sm);
	}

	.shortcut-details code {
		color: var(--body-text-color);
		background: var(--code-background-fill);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		font-family: var(--font-mono);
		font-size: var(--text-md);
	}

	.field-value {
		color: var(--body-text-color);
		font-size: var(--text-md);
	}
</style>

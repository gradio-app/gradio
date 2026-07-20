<script lang="ts">
	import { TEMPLATES } from "./workflow-templates";
	import type { WorkflowTemplate } from "./workflow-templates";

	let { onselect }: { onselect: (t: WorkflowTemplate) => void } = $props();
</script>

<div class="empty-state">
	<div
		class="template-grid"
		onpointerdown={(e) => e.stopPropagation()}
		onpointerup={(e) => e.stopPropagation()}
	>
		{#each TEMPLATES as template}
			<button
				class="template-card"
				style="background: {template.gradient};"
				onclick={() => onselect(template)}
			>
				<div class="card-scrim">
					<div class="card-name">{template.name}</div>
					<div class="card-desc">{template.description}</div>
				</div>
			</button>
		{/each}
	</div>
	<div class="footer-hint">or add a model from the toolbar below</div>
</div>

<style>
	.empty-state {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		pointer-events: none;
	}

	.template-grid {
		display: flex;
		gap: 12px;
		pointer-events: all;
	}

	.template-card {
		position: relative;
		width: 196px;
		height: 148px;
		border: none;
		outline: none;
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
		transition:
			transform 0.16s ease,
			box-shadow 0.16s ease;
	}

	.template-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2);
	}

	.card-scrim {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 12px 13px;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.72) 0%,
			rgba(0, 0, 0, 0.2) 50%,
			transparent 100%
		);
		text-align: left;
	}

	.card-name {
		font-family: "Manrope", sans-serif;
		font-size: 12.5px;
		font-weight: 700;
		color: #fff;
		letter-spacing: -0.01em;
		margin-bottom: 3px;
	}

	.card-desc {
		font-family: "Manrope", sans-serif;
		font-size: 10.5px;
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.45;
	}

	.footer-hint {
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		color: #252738;
	}
</style>

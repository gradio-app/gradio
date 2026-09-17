<script lang="ts">
	import { load_templates } from "./workflow-templates";
	import type { WorkflowTemplate } from "./workflow-templates";

	let {
		onselect,
		inline = false
	}: { onselect: (t: WorkflowTemplate) => void; inline?: boolean } = $props();

	let templates = $state<WorkflowTemplate[]>([]);
	load_templates().then((t) => (templates = t));
</script>

<div class="empty-state" class:inline>
	<div
		class="template-grid"
		onpointerdown={(e) => e.stopPropagation()}
		onpointerup={(e) => e.stopPropagation()}
	>
		{#each templates as template (template.id)}
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
	{#if !inline}
		<div class="footer-hint">or add a model from the toolbar below</div>
	{:else if templates.length === 0}
		<div class="footer-hint">Couldn't reach the template library.</div>
	{/if}
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

	.empty-state.inline {
		position: static;
		inset: auto;
		pointer-events: all;
	}

	.template-grid {
		display: grid;
		grid-template-columns: repeat(3, 196px);
		gap: 12px;
		max-width: 100%;
		pointer-events: all;
	}

	@media (max-width: 720px) {
		.template-grid {
			grid-template-columns: repeat(2, 196px);
		}
	}

	@media (max-width: 480px) {
		.template-grid {
			grid-template-columns: 196px;
		}
	}

	.template-card {
		position: relative;
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

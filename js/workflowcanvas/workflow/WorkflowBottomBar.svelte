<script lang="ts">
	import { MODALITIES, DATASET_MODALITY } from "./workflow-modalities";
	import type { ModalityConfig } from "./workflow-modalities";

	export interface BoundFnTemplate {
		fn: string;
		label: string;
		inputs: { id: string; label: string; type: string }[];
		outputs: { id: string; label: string; type: string }[];
	}

	interface Props {
		running: boolean;
		hasTransforms: boolean;
		boundFns: BoundFnTemplate[];
		onopenpicker: (modality: ModalityConfig) => void;
		onaddinput: (portType: string) => void;
		onaddfn: (template: BoundFnTemplate) => void;
		onrun: () => void;
		onstop: () => void;
	}

	let {
		running,
		hasTransforms,
		boundFns,
		onopenpicker,
		onaddinput,
		onaddfn,
		onrun,
		onstop
	}: Props = $props();

	const INPUT_TYPES = [
		{ key: "image", label: "Image" },
		{ key: "text", label: "Text" },
		{ key: "audio", label: "Audio" },
		{ key: "video", label: "Video" },
		{ key: "number", label: "Number" },
		{ key: "file", label: "File" }
	];

	let showInputMenu = $state(false);
	let showFnMenu = $state(false);

	function closeMenus(): void {
		showInputMenu = false;
		showFnMenu = false;
	}

	function toggleInputMenu(e: MouseEvent) {
		e.stopPropagation();
		showFnMenu = false;
		showInputMenu = !showInputMenu;
	}

	function toggleFnMenu(e: MouseEvent) {
		e.stopPropagation();
		showInputMenu = false;
		showFnMenu = !showFnMenu;
	}

	function handleInputType(type: string, e: MouseEvent) {
		e.stopPropagation();
		showInputMenu = false;
		onaddinput(type);
	}

	function handleFnClick(tmpl: BoundFnTemplate, e: MouseEvent) {
		e.stopPropagation();
		showFnMenu = false;
		onaddfn(tmpl);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="bottom-bar" onclick={(e) => { e.stopPropagation(); closeMenus(); }}>
	<div class="bb-group">
		{#each MODALITIES as m}
			<div class="bb-modality-wrap">
				<button
					class="bb-btn"
					onclick={(e) => { e.stopPropagation(); closeMenus(); onopenpicker(m); }}
					title="Add {m.label} node"
				>
					<span class="bb-icon">
						{#if m.key === "image"}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<rect x="1.5" y="2" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
								<circle cx="5" cy="5.5" r="1.1" stroke="currentColor" stroke-width="1.2"/>
								<path d="M2 10l3-3 3 3 2-2 2 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						{:else if m.key === "audio"}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
								<path d="M2.5 6v2"/>
								<path d="M5 4v6"/>
								<path d="M7.5 2.5v9"/>
								<path d="M10 4.5v5"/>
								<path d="M12.5 6v2"/>
							</svg>
						{:else if m.key === "video"}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<rect x="1.5" y="3.5" width="8.5" height="7" rx="1.4" stroke="currentColor" stroke-width="1.4"/>
								<path d="M10 6l2.5-1.5v5L10 8V6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>
							</svg>
						{:else if m.key === "3d"}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<path d="M7 1.6L12 4.3v5.4L7 12.4 2 9.7V4.3L7 1.6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
								<path d="M2 4.3L7 7l5-2.7" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
								<path d="M7 7v5.4" stroke="currentColor" stroke-width="1.2"/>
							</svg>
						{:else if m.key === "text"}
							<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
								<path d="M3 3h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
								<path d="M7 3v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
							</svg>
						{/if}
					</span>
					<span class="bb-label">{m.label}</span>
				</button>
			</div>
		{/each}
	</div>

	<button
		class="bb-btn"
		onclick={(e) => {
			e.stopPropagation();
			onopenpicker(DATASET_MODALITY);
		}}
		title="Add dataset node"
	>
		<span class="bb-icon">
			<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
				<ellipse cx="7" cy="3.5" rx="5" ry="2" stroke="currentColor" stroke-width="1.5"/>
				<path d="M2 3.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" stroke-width="1.5"/>
				<path d="M2 6.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" stroke-width="1.5"/>
			</svg>
		</span>
		<span class="bb-label">Data</span>
	</button>

	<div class="bb-divider"></div>

	<div class="bb-input-wrap">
		<button class="bb-input-btn" onclick={toggleInputMenu} title="Add input node">
			<svg width="11" height="11" viewBox="0 0 11 11" fill="none">
				<path d="M5.5 1v9M1 5.5h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
			</svg>
			Input
		</button>
		{#if showInputMenu}
			<div class="input-type-menu">
				{#each INPUT_TYPES as t}
					<button class="input-type-opt" onclick={(e) => handleInputType(t.key, e)}
						>{t.label}</button
					>
				{/each}
			</div>
		{/if}
	</div>

	{#if boundFns.length > 0}
		<div class="bb-input-wrap">
			<button class="bb-input-btn" onclick={toggleFnMenu} title="Add Python function node">
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
					<path d="M2 3h2.5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
					<path d="M10 3H7.5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1H10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
				</svg>
				Function
			</button>
			{#if showFnMenu}
				<div class="input-type-menu fn-menu">
					{#each boundFns as t}
						<button class="input-type-opt" onclick={(e) => handleFnClick(t, e)} title={t.fn}>
							{t.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<div class="bb-divider"></div>

	{#if running}
		<button class="bb-run-btn stop" onclick={onstop}>
			<svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor">
				<rect width="9" height="9" rx="1.5"/>
			</svg>
			Stop
		</button>
	{:else}
		<button class="bb-run-btn" onclick={onrun} disabled={!hasTransforms}>
			<svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
				<path d="M0 0l9 5-9 5V0z"/>
			</svg>
			Run
		</button>
	{/if}
</div>

<style>
	.bottom-bar {
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 8px;
		background: rgba(16, 17, 24, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 40px;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(255, 255, 255, 0.03);
		z-index: 20;
		white-space: nowrap;
	}

	.bb-group {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.bb-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border: none;
		border-radius: 28px;
		background: transparent;
		color: #8b8d98;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.bb-btn:hover,
	.bb-btn-active {
		background: rgba(255, 255, 255, 0.06);
		color: #d5d6de;
	}

	.bb-modality-wrap {
		position: relative;
	}

.bb-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.bb-label {
		letter-spacing: -0.01em;
	}

	.bb-divider {
		width: 1px;
		height: 20px;
		background: rgba(255, 255, 255, 0.07);
		flex-shrink: 0;
	}

	.bb-input-wrap {
		position: relative;
	}

	.bb-input-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 6px 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 28px;
		background: transparent;
		color: #6b6e78;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.bb-input-btn:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #a0a2ae;
		border-color: rgba(255, 255, 255, 0.14);
	}

	.input-type-menu {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		background: #16171f;
		border: 1px solid #2a2b36;
		border-radius: 10px;
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
		z-index: 30;
		min-width: 90px;
	}

	.input-type-opt {
		padding: 7px 12px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: #8b8d98;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		text-align: left;
		transition:
			background 0.1s,
			color 0.1s;
	}

	.input-type-opt:hover {
		background: rgba(255, 255, 255, 0.06);
		color: #d5d6de;
	}

	.bb-run-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 16px;
		border: none;
		border-radius: 28px;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: #fff;
		font-family: "Manrope", sans-serif;
		font-size: 12.5px;
		font-weight: 700;
		cursor: pointer;
		transition:
			transform 0.1s,
			box-shadow 0.15s;
		box-shadow: 0 2px 10px rgba(249, 115, 22, 0.3);
	}

	.bb-run-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 18px rgba(249, 115, 22, 0.4);
	}

	.bb-run-btn:active {
		transform: translateY(0);
	}

	.bb-run-btn:disabled {
		opacity: 0.35;
		cursor: default;
		transform: none;
		box-shadow: none;
	}

	.bb-run-btn.stop {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		box-shadow: 0 2px 10px rgba(239, 68, 68, 0.3);
	}

	.bb-run-btn.stop:hover {
		box-shadow: 0 4px 18px rgba(239, 68, 68, 0.4);
	}

	/* Light mode */
	:global(body:not(.dark)) .bottom-bar {
		background: rgba(255, 255, 255, 0.92);
		border-color: rgba(0, 0, 0, 0.08);
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.12),
			0 0 0 1px rgba(0, 0, 0, 0.04);
	}

	:global(body:not(.dark)) .bb-btn {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .bb-btn:hover {
		background: rgba(0, 0, 0, 0.04);
		color: #1a1b25;
	}

	:global(body:not(.dark)) .bb-divider {
		background: rgba(0, 0, 0, 0.1);
	}

	:global(body:not(.dark)) .bb-input-btn {
		border-color: rgba(0, 0, 0, 0.1);
		color: #8b8d98;
	}

	:global(body:not(.dark)) .bb-input-btn:hover {
		background: rgba(0, 0, 0, 0.04);
		color: #3e4050;
	}

	:global(body:not(.dark)) .input-type-menu {
		background: #ffffff;
		border-color: #e2e4ea;
	}

	:global(body:not(.dark)) .input-type-opt {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .input-type-opt:hover {
		background: #f0f1f5;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .bb-models-btn-active {
		color: #ea580c;
		background: rgba(234, 88, 12, 0.08);
	}
</style>

<script lang="ts">
	import { MODALITIES, DATASET_MODALITY } from "./workflow-modalities";
	import type { ModalityConfig } from "./workflow-modalities";
	import ImageIcon from "./icons/ImageIcon.svelte";
	import AudioIcon from "./icons/AudioIcon.svelte";
	import VideoIcon from "./icons/VideoIcon.svelte";
	import Model3DIcon from "./icons/Model3DIcon.svelte";
	import TextIcon from "./icons/TextIcon.svelte";
	import DatasetIcon from "./icons/DatasetIcon.svelte";
	import PlusIcon from "./icons/PlusIcon.svelte";
	import FunctionIcon from "./icons/FunctionIcon.svelte";
	import StopIcon from "./icons/StopIcon.svelte";
	import PlayIcon from "./icons/PlayIcon.svelte";

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
		readOnly?: boolean;
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
		readOnly = false,
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
<div
	class="bottom-bar"
	onclick={(e) => {
		e.stopPropagation();
		closeMenus();
	}}
>
	{#if !readOnly}
		<div class="bb-group">
			{#each MODALITIES as m}
				<div class="bb-modality-wrap">
					<button
						class="bb-btn"
						onclick={(e) => {
							e.stopPropagation();
							closeMenus();
							onopenpicker(m);
						}}
						title="Add {m.label} node"
					>
						<span class="bb-icon">
							{#if m.key === "image"}
								<ImageIcon />
							{:else if m.key === "audio"}
								<AudioIcon />
							{:else if m.key === "video"}
								<VideoIcon />
							{:else if m.key === "3d"}
								<Model3DIcon />
							{:else if m.key === "text"}
								<TextIcon />
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
				<DatasetIcon />
			</span>
			<span class="bb-label">Data</span>
		</button>

		<div class="bb-divider"></div>

		<div class="bb-input-wrap">
			<button
				class="bb-input-btn"
				onclick={toggleInputMenu}
				title="Add input node"
			>
				<PlusIcon />
				Input
			</button>
			{#if showInputMenu}
				<div class="input-type-menu">
					{#each INPUT_TYPES as t}
						<button
							class="input-type-opt"
							onclick={(e) => handleInputType(t.key, e)}>{t.label}</button
						>
					{/each}
				</div>
			{/if}
		</div>

		{#if boundFns.length > 0}
			<div class="bb-input-wrap">
				<button
					class="bb-input-btn"
					onclick={toggleFnMenu}
					title="Add Python function node"
				>
					<FunctionIcon />
					Function
				</button>
				{#if showFnMenu}
					<div class="input-type-menu fn-menu">
						{#each boundFns as t}
							<button
								class="input-type-opt"
								onclick={(e) => handleFnClick(t, e)}
								title={t.fn}
							>
								{t.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div class="bb-divider"></div>
	{/if}

	{#if running}
		<button class="bb-run-btn stop" onclick={onstop}>
			<StopIcon />
			Stop
		</button>
	{:else}
		<button class="bb-run-btn" onclick={onrun} disabled={!hasTransforms}>
			<PlayIcon />
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

	.bb-btn:hover {
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
		bottom: calc(100% + 16px);
		left: 50%;
		transform: translateX(-50%);
		background: #16171f;
		border: 1px solid #2a2b36;
		border-radius: 10px;
		padding: 4px;
		display: flex;
		flex-direction: column;
		gap: 1px;
		/* Negative Y offset casts the shadow UPWARD, since the menu opens
		 * above the bottom bar. The previous downward shadow smudged onto
		 * the button below. Pair with a subtle inset ring for crisper
		 * edge definition on dark bg. */
		box-shadow:
			0 -6px 20px rgba(0, 0, 0, 0.35),
			0 0 0 1px rgba(255, 255, 255, 0.03);
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
</style>

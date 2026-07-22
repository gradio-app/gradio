<script lang="ts">
	let {
		server = {},
		workflowName = "",
		onconnected,
		onclose
	}: {
		server?: Record<string, any>;
		workflowName?: string;
		onconnected: (repoId: string) => void;
		onclose: () => void;
	} = $props();

	let repoInput = $state("");
	let connecting = $state(false);
	let error = $state<string | null>(null);
	let repoType = $state<"dataset" | "bucket">("dataset");

	const suggestedName = $derived(
		workflowName
			? workflowName
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, "") + "-history"
			: "workflow-history"
	);

	async function connect(auto: boolean) {
		error = null;
		connecting = true;
		try {
			const raw = await server.connect_history([
				repoInput.trim(),
				auto,
				repoType
			]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (data.error) {
				error = data.error;
			} else {
				onconnected(data.repo_id);
			}
		} catch (e: any) {
			error = e?.message ?? "Connection failed";
		} finally {
			connecting = false;
		}
	}
</script>

<div
	class="connect-backdrop"
	role="dialog"
	aria-label="Connect dataset"
	onpointerdown={(e) => {
		if (e.target === e.currentTarget) onclose();
	}}
>
	<div class="connect-panel">
		<div class="connect-header">
			<span class="connect-title">Connect generation history</span>
			<button class="connect-close" onclick={onclose} aria-label="Close"
				>&#x2715;</button
			>
		</div>

		<p class="connect-desc">
			Save every generation to a private HF Hub repo. Browse and reload past
			outputs from the History panel.
		</p>

		<div class="connect-type-toggle">
			<button
				class="type-btn"
				class:active={repoType === "dataset"}
				onclick={() => (repoType = "dataset")}
				title="Git-based dataset repo. Works on free accounts."
			>
				Dataset
			</button>
			<button
				class="type-btn"
				class:active={repoType === "bucket"}
				onclick={() => (repoType = "bucket")}
				title="S3-like Hub bucket. No commit noise. Requires a paid plan."
			>
				Bucket
			</button>
		</div>

		<div class="connect-auto">
			<button
				class="connect-auto-btn"
				disabled={connecting}
				onclick={() => connect(true)}
			>
				{connecting ? "Connecting..." : "Auto-create"}
				<span class="connect-auto-hint">{suggestedName}</span>
			</button>
		</div>

		<div class="connect-divider">
			<span>or enter a {repoType} name</span>
		</div>

		<div class="connect-manual">
			<input
				class="connect-input"
				type="text"
				placeholder={repoType === "bucket"
					? "username/bucket-name"
					: "username/dataset-name"}
				bind:value={repoInput}
				disabled={connecting}
				onkeydown={(e) => {
					if (e.key === "Enter" && repoInput.trim()) connect(false);
				}}
			/>
			<button
				class="connect-btn"
				disabled={connecting || !repoInput.trim()}
				onclick={() => connect(false)}
			>
				{connecting ? "..." : "Connect"}
			</button>
		</div>

		{#if error}
			<div class="connect-error">{error}</div>
		{/if}
	</div>
</div>

<style>
	.connect-backdrop {
		position: fixed;
		inset: 0;
		z-index: 400;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.5);
	}

	.connect-panel {
		background: #16171f;
		border: 1px solid #2a2b38;
		border-radius: 10px;
		padding: 20px;
		width: 360px;
		max-width: 95vw;
	}

	:global(body:not(.dark)) .connect-panel {
		background: #fff;
		border-color: #e5e7eb;
	}

	.connect-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.connect-title {
		font-size: 13px;
		font-weight: 600;
		color: #e8e9f0;
	}

	:global(body:not(.dark)) .connect-title {
		color: #1a1b25;
	}

	.connect-close {
		background: none;
		border: none;
		color: #7c7f99;
		font-size: 14px;
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 4px;
	}

	.connect-close:hover {
		background: #2a2b38;
		color: #e8e9f0;
	}

	.connect-desc {
		font-size: 12px;
		color: #7c7f99;
		margin: 0 0 12px;
		line-height: 1.5;
	}

	.connect-type-toggle {
		display: flex;
		gap: 4px;
		margin-bottom: 14px;
		background: #0c0d10;
		border: 1px solid #2a2b38;
		border-radius: 6px;
		padding: 3px;
	}

	:global(body:not(.dark)) .connect-type-toggle {
		background: #f3f4f6;
		border-color: #e5e7eb;
	}

	.type-btn {
		flex: 1;
		background: none;
		border: none;
		border-radius: 4px;
		color: #7c7f99;
		font-size: 12px;
		font-weight: 500;
		padding: 5px 0;
		cursor: pointer;
		transition:
			background 0.1s,
			color 0.1s;
	}

	.type-btn.active {
		background: #22232f;
		color: #e8e9f0;
	}

	:global(body:not(.dark)) .type-btn.active {
		background: #fff;
		color: #1a1b25;
	}

	.connect-auto-btn {
		width: 100%;
		background: #ff7a38;
		border: none;
		border-radius: 6px;
		color: #fff;
		font-size: 13px;
		font-weight: 500;
		padding: 9px 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.connect-auto-btn:hover:not(:disabled) {
		background: #e86d2f;
	}

	.connect-auto-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.connect-auto-hint {
		font-size: 11px;
		opacity: 0.8;
		font-weight: 400;
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 180px;
	}

	.connect-divider {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 14px 0;
		color: #4a4b5a;
		font-size: 11px;
	}

	.connect-divider::before,
	.connect-divider::after {
		content: "";
		flex: 1;
		height: 1px;
		background: #2a2b38;
	}

	:global(body:not(.dark)) .connect-divider::before,
	:global(body:not(.dark)) .connect-divider::after {
		background: #e5e7eb;
	}

	:global(body:not(.dark)) .connect-divider {
		color: #9ca3af;
	}

	.connect-manual {
		display: flex;
		gap: 8px;
	}

	.connect-input {
		flex: 1;
		background: #0c0d10;
		border: 1px solid #2a2b38;
		border-radius: 6px;
		color: #e8e9f0;
		font-size: 12px;
		padding: 7px 10px;
		font-family: monospace;
		min-width: 0;
	}

	.connect-input:focus {
		outline: none;
		border-color: #ff7a38;
	}

	.connect-input::placeholder {
		color: #4a4b5a;
	}

	:global(body:not(.dark)) .connect-input {
		background: #f9fafb;
		border-color: #e5e7eb;
		color: #1a1b25;
	}

	.connect-btn {
		background: #22232f;
		border: 1px solid #3a3b4a;
		border-radius: 6px;
		color: #9a9caa;
		font-size: 12px;
		font-weight: 500;
		padding: 7px 14px;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.connect-btn:hover:not(:disabled) {
		background: #2a2b38;
		color: #e8e9f0;
	}

	.connect-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(body:not(.dark)) .connect-btn {
		background: #f3f4f6;
		border-color: #e5e7eb;
		color: #6b7280;
	}

	.connect-error {
		margin-top: 10px;
		font-size: 11px;
		color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
		border-radius: 5px;
		padding: 6px 10px;
	}
</style>

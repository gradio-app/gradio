<script lang="ts">
	import { onMount } from "svelte";
	import {
		ensure_bucket,
		is_valid_bucket_id,
		list_user_buckets,
		type BucketInfo
	} from "@gradio/client";

	let {
		root,
		workflowName = "",
		onconnected,
		onclose
	}: {
		root: string;
		workflowName?: string;
		onconnected: (bucketId: string) => void;
		onclose: () => void;
	} = $props();

	let repoInput = $state("");
	let connecting = $state(false);
	let error = $state<string | null>(null);
	let existingBuckets = $state<BucketInfo[]>([]);

	const suggestedName = $derived(
		workflowName
			? workflowName
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, "") + "-history"
			: "workflow-history"
	);

	async function connect(bucketId: string) {
		error = null;
		if (!is_valid_bucket_id(bucketId)) {
			error = "Invalid bucket ID — expected `username/bucket-name`.";
			return;
		}
		connecting = true;
		const result = await ensure_bucket(root, bucketId);
		connecting = false;
		if (!result.ok) {
			if (result.reason === "auth") {
				error = "Sign in with 🤗 first to connect a bucket.";
			} else if (result.reason === "no_permission") {
				error = `Cannot access or create "${bucketId}". Either create it at https://huggingface.co/new-bucket, or add \`hf_oauth_scopes: [manage-repos]\` to the Space README.`;
			} else {
				error = `Could not connect: ${result.detail ?? result.reason ?? "unknown error"}`;
			}
			return;
		}
		onconnected(bucketId);
	}

	onMount(async () => {
		try {
			existingBuckets = await list_user_buckets(root);
		} catch {
			// silently ignore — bucket list is optional
		}
	});
</script>

<div
	class="connect-backdrop"
	role="dialog"
	aria-label="Connect bucket"
	onpointerdown={(e) => {
		if (e.target === e.currentTarget) onclose();
	}}
>
	<div class="connect-panel">
		<div class="connect-header">
			<span class="connect-title">Connect history</span>
			<button class="connect-close" onclick={onclose} aria-label="Close"
				>&#x2715;</button
			>
		</div>

		<p class="connect-desc">
			Save every generation to a private HF Hub bucket. Browse and reload past
			outputs from the History panel.
		</p>

		{#if existingBuckets.length > 0}
			<div class="bucket-list">
				{#each existingBuckets as bucket}
					<button
						class="bucket-item"
						disabled={connecting}
						onclick={() => connect(bucket.id)}
					>
						<span class="bucket-id">{bucket.id}</span>
					</button>
				{/each}
			</div>
			<div class="connect-divider"><span>or use a new bucket</span></div>
		{/if}

		<p class="connect-hint">
			Suggested: <code>username/{suggestedName}</code>. A new bucket is
			auto-created on first use.
		</p>

		<div class="connect-manual">
			<input
				class="connect-input"
				type="text"
				placeholder="username/{suggestedName}"
				bind:value={repoInput}
				disabled={connecting}
				onkeydown={(e) => {
					if (e.key === "Enter" && repoInput.trim()) connect(repoInput.trim());
				}}
			/>
			<button
				class="connect-btn"
				disabled={connecting || !repoInput.trim()}
				onclick={() => connect(repoInput.trim())}
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
		width: 440px;
		max-width: 95vw;
	}

	.connect-hint {
		font-size: 12px;
		color: #7c7f99;
		margin: 0 0 8px;
		line-height: 1.5;
	}

	.connect-hint code {
		font-family: monospace;
		font-size: 11.5px;
		background: #0c0d10;
		border: 1px solid #2a2b38;
		border-radius: 4px;
		padding: 1px 5px;
		color: #c8cad8;
		word-break: break-all;
	}

	:global(body:not(.dark)) .connect-hint {
		color: #6b7280;
	}

	:global(body:not(.dark)) .connect-hint code {
		background: #f9fafb;
		border-color: #e5e7eb;
		color: #374151;
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

	.bucket-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 12px;
	}

	.bucket-item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		background: #1e1f2a;
		border: 1px solid #2a2b38;
		border-radius: 6px;
		color: #c8cad8;
		font-size: 12px;
		padding: 7px 10px;
		cursor: pointer;
		text-align: left;
		transition:
			border-color 0.1s,
			background 0.1s;
	}

	.bucket-item:hover:not(:disabled) {
		border-color: #ff7a38;
		background: #252636;
		color: #e8e9f0;
	}

	.bucket-item:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(body:not(.dark)) .bucket-item {
		background: #f9fafb;
		border-color: #e5e7eb;
		color: #374151;
	}

	:global(body:not(.dark)) .bucket-item:hover:not(:disabled) {
		border-color: #ff7a38;
		background: #fff;
	}

	.bucket-id {
		font-family: monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

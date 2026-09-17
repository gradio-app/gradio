<script lang="ts">
	import { onMount } from "svelte";
	import {
		connect_bucket,
		is_valid_bucket_id,
		list_user_buckets
	} from "@gradio/client";

	let {
		root,
		workflowName = "",
		username = "",
		signedIn = true,
		onsignin,
		onconnected,
		onclose
	}: {
		root: string;
		workflowName?: string;
		username?: string;
		signedIn?: boolean;
		onsignin?: () => void;
		onconnected: (bucketId: string) => void;
		onclose: () => void;
	} = $props();

	const suggestedName = $derived(
		workflowName
			? workflowName
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-|-$/g, "") + "-history"
			: "workflow-history"
	);
	const suggestedId = $derived(
		username ? `${username}/${suggestedName}` : `username/${suggestedName}`
	);

	let repoInput = $state(username ? `${username}/${suggestedName}` : "");
	let connecting = $state(false);
	let error = $state<string | null>(null);
	let existingBuckets = $state<string[]>([]);
	const MAX_LISTED = 50;
	const listedBuckets = $derived(existingBuckets.slice(0, MAX_LISTED));
	const hiddenBucketCount = $derived(
		Math.max(0, existingBuckets.length - MAX_LISTED)
	);

	async function connect(bucketId: string) {
		error = null;
		if (!is_valid_bucket_id(bucketId)) {
			error = "Invalid bucket ID — expected `username/bucket-name`.";
			return;
		}
		connecting = true;
		const result = await connect_bucket(root, bucketId);
		connecting = false;
		if (!result.ok) {
			if (result.status === 401) {
				error = "Sign in with 🤗 first to connect a bucket.";
			} else if (result.status === 403) {
				error = `Cannot access or create "${bucketId}". Either create it at https://huggingface.co/new-bucket, or add \`hf_oauth_scopes: [manage-repos]\` to the Space README.`;
			} else if (result.status === 422) {
				error = "Invalid bucket ID — expected `username/bucket-name`.";
			} else {
				error = `Could not connect: ${result.detail ?? result.status}`;
			}
			return;
		}
		onconnected(bucketId);
	}

	onMount(async () => {
		if (!signedIn) return;
		const result = await list_user_buckets(root);
		if (result.ok) existingBuckets = result.data;
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
			Save every generation to an HF Hub bucket. Browse and reload past outputs
			from the History panel.
		</p>

		{#if !signedIn}
			<div class="connect-signin">
				<p class="connect-hint">
					Sign in with your Hugging Face account to save history to a bucket
					under your name.
				</p>
				<button class="connect-btn" onclick={() => onsignin?.()}>
					Sign in with 🤗
				</button>
			</div>
		{:else}
			{#if existingBuckets.length > 0}
				<div class="bucket-list">
					{#each listedBuckets as bucket}
						<button
							class="bucket-item"
							disabled={connecting}
							onclick={() => connect(bucket)}
						>
							<span class="bucket-id">{bucket}</span>
						</button>
					{/each}
				</div>
				{#if hiddenBucketCount > 0}
					<p class="connect-hint">
						{hiddenBucketCount} more not shown — type its full id below.
					</p>
				{/if}
				<div class="connect-divider"><span>or use a new bucket</span></div>
			{/if}

			<p class="connect-hint">
				Suggested: <code>{suggestedId}</code>. A new bucket is auto-created on
				first use.
			</p>

			<div class="connect-manual">
				<input
					class="connect-input"
					type="text"
					placeholder={suggestedId}
					bind:value={repoInput}
					disabled={connecting}
					onkeydown={(e) => {
						if (e.key === "Enter" && repoInput.trim())
							connect(repoInput.trim());
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
		max-height: 85vh;
		overflow-y: auto;
		overscroll-behavior: contain;
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
		max-height: 180px;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding-right: 2px;
	}

	.bucket-list::-webkit-scrollbar {
		width: 8px;
	}

	.bucket-list::-webkit-scrollbar-thumb {
		background: #2a2b38;
		border-radius: 4px;
	}

	.bucket-list::-webkit-scrollbar-thumb:hover {
		background: #3a3b4a;
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
		color: #c8cad8;
		background: #1e1f2a;
		border: 1px solid #2a2b38;
		border-radius: 5px;
		padding: 6px 10px;
	}
</style>

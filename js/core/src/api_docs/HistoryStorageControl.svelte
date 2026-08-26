<script lang="ts">
	import { onMount } from "svelte";
	import {
		connect_bucket,
		list_user_buckets,
		read_run_history_storage,
		set_run_history_storage,
		type RunHistoryScope,
		type RunHistoryStorage
	} from "@gradio/client";

	interface HistoryStorageScope extends RunHistoryScope {
		title?: string;
		components?: { type: string }[];
	}

	interface Props {
		root: string;
		scope: HistoryStorageScope;
		storage?: RunHistoryStorage;
	}

	let {
		root,
		scope,
		storage = $bindable<RunHistoryStorage>({ type: "browser" })
	}: Props = $props();

	let menu_open = $state(false);
	let connect_open = $state(false);
	let connecting = $state(false);
	let buckets_loading = $state(false);
	let buckets = $state<string[]>([]);
	let bucket_input = $state("");
	let connect_error: string | null = $state(null);

	const bucket_id = $derived(storage.bucket_id ?? "");
	const using_bucket = $derived(storage.type === "bucket");
	const oauth_available = $derived(
		scope.components?.some((component) => component.type === "loginbutton") ??
			false
	);
	const running_locally = $derived(
		["localhost", "127.0.0.1", "::1", "[::1]"].includes(
			window.location.hostname
		)
	);

	onMount(() => {
		storage = read_run_history_storage(scope);
	});

	function authentication_error(): string {
		if (running_locally) {
			return "Log in locally with `hf auth login`, then try again.";
		}
		if (oauth_available) {
			return "Sign in with Hugging Face to connect a bucket.";
		}
		return "This app must enable Hugging Face OAuth before visitors can connect buckets.";
	}

	function use_browser(): void {
		storage = { type: "browser", ...(bucket_id ? { bucket_id } : {}) };
		set_run_history_storage(scope, storage);
		menu_open = false;
	}

	async function use_bucket(id: string): Promise<void> {
		connecting = true;
		connect_error = null;
		const result = await connect_bucket(root, id);
		connecting = false;
		if (!result.ok) {
			connect_error =
				result.status === 401
					? authentication_error()
					: result.status === 403
						? `You do not have write access to “${id}”.`
						: (result.detail ?? "Could not connect this bucket.");
			return;
		}
		storage = { type: "bucket", bucket_id: id };
		set_run_history_storage(scope, storage);
		connect_open = false;
		menu_open = false;
	}

	async function open_connect(): Promise<void> {
		menu_open = false;
		connect_open = true;
		connect_error = null;
		buckets_loading = true;
		const result = await list_user_buckets(root);
		buckets_loading = false;
		if (!result.ok) {
			buckets = [];
			connect_error =
				result.status === 401
					? authentication_error()
					: (result.detail ?? "Could not load your buckets.");
			return;
		}
		buckets = result.data.slice(0, 50);
		const namespace = buckets[0]?.split("/")[0] || scope.username || "";
		const name = (scope.title || "gradio-app")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		bucket_input = namespace ? `${namespace}/${name}-history` : "";
	}

	function sign_in(): void {
		window.location.assign(
			`${root.replace(/\/+$/, "")}/login/huggingface?_target_url=${encodeURIComponent(window.location.href)}`
		);
	}

	function close_on_escape(event: KeyboardEvent): void {
		if (event.key !== "Escape") return;
		menu_open = false;
		connect_open = false;
	}
</script>

<svelte:window onkeydown={close_on_escape} />

<div class="storage-row">
	<span>History storage</span>
	<div class="storage-picker">
		<button
			class="storage-trigger"
			class:bucket={using_bucket}
			type="button"
			aria-haspopup="menu"
			aria-expanded={menu_open}
			onclick={() => (menu_open = !menu_open)}
		>
			<span class="storage-icon" aria-hidden="true"
				>{using_bucket ? "◈" : "▣"}</span
			>
			<span class="storage-label"
				>{using_bucket ? bucket_id : "This browser"}</span
			>
			<span class="chevron" aria-hidden="true">⌄</span>
		</button>
		{#if menu_open}
			<div class="storage-menu" role="menu" aria-label="History storage">
				<div class="menu-heading">Save new runs to</div>
				<button
					class="storage-option"
					class:selected={!using_bucket}
					role="menuitemradio"
					aria-checked={!using_bucket}
					onclick={use_browser}
				>
					<span class="option-radio" aria-hidden="true"></span>
					<span>
						<strong>This browser</strong>
						<small>Private and available only on this device</small>
					</span>
				</button>
				{#if bucket_id}
					<button
						class="storage-option"
						class:selected={using_bucket}
						role="menuitemradio"
						aria-checked={using_bucket}
						disabled={connecting}
						onclick={() => use_bucket(bucket_id)}
					>
						<span class="option-radio" aria-hidden="true"></span>
						<span>
							<strong>{bucket_id}</strong>
							<small>Stored in a Hugging Face bucket</small>
						</span>
					</button>
				{/if}
				<button class="connect-option" onclick={open_connect}>
					<span aria-hidden="true">＋</span>
					{bucket_id ? "Change bucket" : "Connect a bucket"}
				</button>
			</div>
		{/if}
	</div>
	<span class="storage-detail">
		{using_bucket
			? "Available anywhere you can access this bucket"
			: "Private to this device"}
	</span>
</div>

{#if connect_open}
	<div
		class="modal-backdrop"
		role="presentation"
		onpointerdown={(event) => {
			if (event.target === event.currentTarget) connect_open = false;
		}}
	>
		<div
			class="connect-modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="connect-title"
		>
			<header class="modal-header">
				<div>
					<div class="modal-eyebrow">Hugging Face</div>
					<h2 id="connect-title">Connect history storage</h2>
				</div>
				<button
					class="modal-close"
					aria-label="Close"
					onclick={() => (connect_open = false)}>×</button
				>
			</header>
			<p class="modal-copy">
				Save future runs to a Hub bucket and open them from any browser with
				access. Runs already stored in this browser stay here.
			</p>

			{#if buckets_loading}
				<div class="modal-loading">
					<div class="spinner" aria-hidden="true"></div>
					Loading your buckets…
				</div>
			{:else}
				{#if buckets.length}
					<div class="field-label">Your buckets</div>
					<div class="bucket-list">
						{#each buckets as bucket}
							<button
								class="bucket-choice"
								disabled={connecting}
								onclick={() => use_bucket(bucket)}
							>
								<span class="bucket-mark" aria-hidden="true">◈</span>
								<span>{bucket}</span>
								<span class="choice-arrow" aria-hidden="true">→</span>
							</button>
						{/each}
					</div>
					<div class="divider"><span>or use another bucket</span></div>
				{/if}

				<label class="field-label" for="history-bucket-id">Bucket ID</label>
				<div class="bucket-entry">
					<input
						id="history-bucket-id"
						bind:value={bucket_input}
						placeholder="username/my-app-history"
						disabled={connecting}
						onkeydown={(event) => {
							if (event.key === "Enter" && bucket_input.trim()) {
								void use_bucket(bucket_input.trim());
							}
						}}
					/>
					<button
						class="connect-button"
						disabled={connecting || !bucket_input.trim()}
						onclick={() => use_bucket(bucket_input.trim())}
					>
						{connecting ? "Connecting…" : "Connect"}
					</button>
				</div>
				<p class="field-help">
					New buckets are private by default. Organization buckets are
					supported.
				</p>

				{#if connect_error}
					<div class="connect-error" role="alert">
						<span>{connect_error}</span>
						{#if oauth_available && connect_error.startsWith("Sign in")}
							<button onclick={sign_in}>Sign in with Hugging Face</button>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.storage-row {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 14px;
	}
	.storage-picker {
		position: relative;
	}
	.storage-trigger {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		max-width: min(420px, 50vw);
		padding: 5px 9px;
		border: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: 999px;
		background: var(--background-fill-secondary, #fafafa);
		color: var(--body-text-color, #27272a);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
		transition: 120ms ease;
	}
	.storage-trigger:hover,
	.storage-trigger[aria-expanded="true"] {
		border-color: var(--color-accent, #f97316);
		background: var(--background-fill-primary, #fff);
	}
	.storage-trigger.bucket .storage-icon,
	.bucket-mark {
		color: var(--color-accent, #f97316);
	}
	.storage-icon {
		color: var(--body-text-color-subdued, #71717a);
		font-size: 13px;
	}
	.storage-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.chevron {
		margin-top: -2px;
		color: var(--body-text-color-subdued, #71717a);
	}
	.storage-detail {
		color: var(--body-text-color-subdued, #71717a);
		font-size: 13px;
	}
	.storage-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		z-index: 20;
		box-sizing: border-box;
		width: min(360px, calc(100vw - 32px));
		padding: 8px;
		border: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: 14px;
		background: var(--block-background-fill, #fff);
		box-shadow: 0 16px 42px rgb(0 0 0 / 16%);
	}
	.menu-heading {
		padding: 7px 10px 6px;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.storage-option,
	.connect-option {
		display: flex;
		box-sizing: border-box;
		width: 100%;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border: 0;
		border-radius: 9px;
		background: transparent;
		color: var(--body-text-color, #27272a);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}
	.storage-option:hover,
	.connect-option:hover {
		background: var(--background-fill-secondary, #fafafa);
	}
	.storage-option strong,
	.storage-option small {
		display: block;
	}
	.storage-option strong {
		max-width: 270px;
		overflow: hidden;
		font-size: 13px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.storage-option small {
		margin-top: 2px;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 11px;
	}
	.option-radio {
		box-sizing: border-box;
		width: 16px;
		height: 16px;
		flex: none;
		border: 1.5px solid var(--border-color-primary, #d4d4d8);
		border-radius: 50%;
	}
	.storage-option.selected .option-radio {
		border: 5px solid var(--color-accent, #f97316);
	}
	.connect-option {
		margin-top: 4px;
		border-top: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: 0 0 9px 9px;
		color: var(--color-accent, #ea580c);
		font-size: 13px;
		font-weight: 600;
	}
	.modal-backdrop {
		display: grid;
		position: fixed;
		z-index: 1000;
		inset: 0;
		place-items: center;
		padding: 20px;
		background: rgb(9 9 11 / 52%);
		backdrop-filter: blur(3px);
	}
	.connect-modal {
		box-sizing: border-box;
		width: min(100%, 540px);
		max-height: min(760px, calc(100vh - 40px));
		overflow-y: auto;
		padding: 24px;
		border: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: 18px;
		background: var(--block-background-fill, #fff);
		box-shadow: 0 28px 80px rgb(0 0 0 / 28%);
	}
	.modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20px;
	}
	.modal-eyebrow {
		margin-bottom: 4px;
		color: var(--color-accent, #f97316);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}
	.modal-header h2 {
		margin: 0;
		font-size: 22px;
		line-height: 1.25;
	}
	.modal-close {
		display: grid;
		width: 32px;
		height: 32px;
		flex: none;
		place-items: center;
		padding: 0 0 2px;
		border: 0;
		border-radius: 50%;
		background: var(--background-fill-secondary, #f4f4f5);
		color: var(--body-text-color-subdued, #71717a);
		font: inherit;
		font-size: 22px;
		cursor: pointer;
	}
	.modal-close:hover {
		color: var(--body-text-color, #27272a);
	}
	.modal-copy {
		margin: 12px 0 22px;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 14px;
		line-height: 1.55;
	}
	.modal-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		min-height: 120px;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 14px;
	}
	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border-color-primary, #e4e4e7);
		border-top-color: var(--color-accent, #f97316);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}
	.field-label {
		display: block;
		margin: 0 0 7px;
		color: var(--body-text-color, #27272a);
		font-size: 12px;
		font-weight: 700;
	}
	.bucket-list {
		display: flex;
		max-height: 190px;
		overflow-y: auto;
		flex-direction: column;
		gap: 6px;
		padding-right: 2px;
	}
	.bucket-choice {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: 10px;
		background: var(--background-fill-secondary, #fafafa);
		color: var(--body-text-color, #27272a);
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		transition: 120ms ease;
	}
	.bucket-choice:hover {
		border-color: var(--color-accent, #f97316);
		background: var(--block-background-fill, #fff);
	}
	.bucket-choice span:nth-child(2) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.choice-arrow {
		color: var(--body-text-color-subdued, #71717a);
	}
	.divider {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 18px 0;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 11px;
		text-transform: uppercase;
	}
	.divider::before,
	.divider::after {
		height: 1px;
		flex: 1;
		background: var(--border-color-primary, #e4e4e7);
		content: "";
	}
	.bucket-entry {
		display: flex;
		gap: 8px;
	}
	.bucket-entry input {
		box-sizing: border-box;
		min-width: 0;
		height: 40px;
		flex: 1;
		padding: 0 12px;
		border: 1px solid var(--border-color-primary, #d4d4d8);
		border-radius: 9px;
		background: var(--input-background-fill, #fff);
		color: var(--body-text-color, #27272a);
		font: inherit;
		font-size: 13px;
		outline: none;
	}
	.bucket-entry input:focus {
		border-color: var(--color-accent, #f97316);
		box-shadow: 0 0 0 3px var(--color-accent-soft, #ffedd5);
	}
	.connect-button {
		min-width: 94px;
		padding: 0 15px;
		border: 1px solid var(--button-primary-border-color, #ea580c);
		border-radius: 9px;
		background: var(--button-primary-background-fill, #f97316);
		color: var(--button-primary-text-color, #fff);
		font: inherit;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
	}
	.connect-button:hover:not(:disabled) {
		background: var(--button-primary-background-fill-hover, #ea580c);
	}
	.connect-button:disabled,
	.bucket-choice:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.field-help {
		margin: 7px 0 0;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 11px;
	}
	.connect-error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 16px;
		padding: 11px 12px;
		border: 1px solid #fca5a5;
		border-radius: 10px;
		background: #fef2f2;
		color: #991b1b;
		font-size: 12px;
		line-height: 1.4;
	}
	.connect-error button {
		flex: none;
		padding: 6px 9px;
		border: 1px solid currentColor;
		border-radius: 7px;
		background: transparent;
		color: inherit;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
	:global(.dark) .connect-error {
		border-color: #7f1d1d;
		background: rgb(127 29 29 / 22%);
		color: #fca5a5;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (max-width: 700px) {
		.storage-row {
			align-items: flex-start;
			flex-wrap: wrap;
		}
		.storage-detail {
			width: 100%;
		}
		.storage-trigger {
			max-width: calc(100vw - 160px);
		}
		.modal-backdrop {
			align-items: end;
			padding: 0;
		}
		.connect-modal {
			width: 100%;
			max-height: 88vh;
			padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
			border-radius: 18px 18px 0 0;
		}
		.bucket-entry,
		.connect-error {
			align-items: stretch;
			flex-direction: column;
		}
		.connect-button {
			height: 40px;
		}
	}
</style>

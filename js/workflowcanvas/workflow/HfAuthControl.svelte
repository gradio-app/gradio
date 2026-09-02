<script lang="ts">
	/**
	 * The one way to sign in to Hugging Face from the canvas.
	 *
	 * On a Space that means OAuth; running locally it means pasting a token.
	 * Both the toolbar and the history panel mount this, so the two can never
	 * drift into offering different affordances for the same thing.
	 */
	let {
		auth,
		onSpace = false,
		onsignin,
		variant = "toolbar"
	}: {
		auth: {
			token: string;
			status: string;
			oauthAvailable: boolean;
			setPAT: (value: string) => void | Promise<void>;
			signIn: () => void;
		};
		onSpace?: boolean;
		onsignin?: () => void;
		variant?: "toolbar" | "panel";
	} = $props();
</script>

{#if onSpace}
	<button
		class="login-btn"
		class:panel={variant === "panel"}
		onclick={() => (onsignin ? onsignin() : auth.signIn())}
		disabled={!auth.oauthAvailable}
		title={auth.oauthAvailable
			? undefined
			: "OAuth is not enabled for this Space. If you're the owner, add `hf_oauth: true` to the Space README and redeploy."}
	>
		Sign in with 🤗
	</button>
{:else}
	<form
		class="token-form"
		class:panel={variant === "panel"}
		onsubmit={(e) => e.preventDefault()}
	>
		<input
			class="token-input"
			class:panel={variant === "panel"}
			class:invalid={auth.status === "invalid"}
			type="password"
			placeholder="Paste HF token (hf_...)"
			value={auth.token}
			onchange={(e) => auth.setPAT(e.currentTarget.value)}
			title="Hugging Face token"
		/>
		{#if auth.status === "validating"}
			<span class="token-status validating">checking…</span>
		{:else if auth.status === "invalid"}
			<span class="token-status invalid">invalid</span>
		{/if}
	</form>
{/if}

<style>
	.login-btn {
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 500;
		padding: 5px 12px;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		background: transparent;
		color: #a0a2ae;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.login-btn:hover:not(:disabled) {
		background: #16171f;
		color: #e0e1e6;
		border-color: #2a2b36;
	}

	.login-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.login-btn.panel {
		padding: 7px 14px;
		border-color: #3a3b4a;
		background: #22232f;
		color: #c8cad8;
	}

	.token-form {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.token-form.panel {
		flex-direction: column;
		gap: 6px;
	}

	.token-input {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		padding: 5px 10px;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		background: #0c0d10;
		color: #6b6e78;
		outline: none;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.token-input.panel {
		width: 100%;
		max-width: 260px;
		padding: 7px 10px;
		border-color: #2a2b38;
		text-align: center;
	}

	.token-input::placeholder {
		color: #4a4d57;
	}

	.token-input:focus {
		background: #16171f;
		color: #a0a2ae;
		border-color: #ff7a38;
		box-shadow: 0 0 0 2px rgb(255 122 56 / 12%);
	}

	.token-input.invalid {
		border-color: #ef4444;
		box-shadow: 0 0 0 2px rgb(239 68 68 / 10%);
	}

	.token-status {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 600;
		white-space: nowrap;
	}

	.token-status.validating {
		color: #8b8d98;
		font-weight: 500;
		font-style: italic;
	}

	.token-status.invalid {
		color: #ef4444;
	}

	:global(body:not(.dark)) .login-btn {
		border-color: #e2e4ea;
		color: #6b7280;
	}

	:global(body:not(.dark)) .login-btn:hover:not(:disabled) {
		background: #f3f4f6;
		color: #1a1b25;
		border-color: #d4d6dd;
	}

	:global(body:not(.dark)) .login-btn.panel {
		background: #f3f4f6;
		color: #374151;
	}

	:global(body:not(.dark)) .token-input {
		background: #f9fafb;
		border-color: #e2e4ea;
		color: #4b5563;
	}

	:global(body:not(.dark)) .token-input::placeholder {
		color: #9ca3af;
	}

	:global(body:not(.dark)) .token-input:focus {
		background: #fff;
		color: #1a1b25;
	}
</style>

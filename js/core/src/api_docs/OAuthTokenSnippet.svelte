<script lang="ts">
	let {
		oauth_token,
		current_language
	}: {
		oauth_token: "required" | "optional";
		current_language:
			| "python"
			| "javascript"
			| "bash"
			| "skill"
			| "cli"
			| "mcp";
	} = $props();

	let how = $derived(
		current_language === "javascript"
			? "Client.connect()"
			: current_language === "python"
				? "Client()"
				: null
	);
</script>

<h4>
	<div class="toggle-icon">
		<div class="toggle-dot" />
	</div>
	Acts on your behalf:
</h4>

<div class="note">
	<p>
		This endpoint's function takes a <span class="code">gr.OAuthToken</span>, so
		it receives your Hugging Face token and can act as you. It is
		<span style="font-weight:bold"
			>{oauth_token === "required" ? "Required" : "Optional"}</span
		>.
	</p>
	<p class="desc">
		{#if how}
			Pass <span class="code">oauth_token</span> to
			<span class="code">{how}</span> to grant it. This differs from the token that
			authenticates you to the app itself, and is only ever sent to endpoints that
			declare they take one.
		{:else}
			Send it as the <span class="code">oauth_token</span> key of the request body.
			This differs from the token that authenticates you to the app itself, so only
			include it for endpoints that declare they take one.
		{/if}
	</p>
</div>

<style>
	h4 {
		display: flex;
		align-items: center;
		margin-top: var(--size-6);
		margin-bottom: var(--size-3);
		color: var(--body-text-color);
		font-weight: var(--weight-bold);
	}

	.toggle-icon {
		display: flex;
		align-items: center;
		margin-right: var(--size-2);
		border-radius: var(--radius-full);
		background: var(--color-grey-300);
		width: 12px;
		height: 4px;
	}

	.toggle-dot {
		border-radius: var(--radius-full);
		background: var(--color-grey-700);
		width: 6px;
		height: 6px;
		margin-right: auto;
	}

	.note {
		margin: 10px;
	}

	.note p {
		font-size: var(--text-lg);
	}

	/* A step down, so the mono spans sit optically level with the prose. */
	.code {
		font-family: var(--font-mono);
		font-size: var(--text-md);
		display: inline;
		background: var(--color-accent-soft);
		color: var(--color-accent);
		padding: var(--size-1);
	}

	.desc {
		color: var(--body-text-color-subdued);
		margin-top: var(--size-1);
	}
</style>

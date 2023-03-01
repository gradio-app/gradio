<script lang="ts">
	import { Component as Form } from "./components/Form";
	import { Component as Textbox } from "./components/Textbox";
	import { Button } from "@gradio/button";
	export let root: string;
	export let id: number;
	export let auth_message: string | null;
	export let app_mode: boolean;
	export let is_space: boolean;

	let username = "";
	let password = "";
	let incorrect_credentials = false;

	const submit = async () => {
		const formData = new FormData();
		formData.append("username", username);
		formData.append("password", password);

		let response = await fetch(root + "/login", {
			method: "POST",
			body: formData
		});
		if (response.status === 400) {
			incorrect_credentials = true;
			username = "";
			password = "";
		} else if (response.status == 200) {
			location.reload();
		}
	};
</script>

<div class="wrap" class:min-h-screen={app_mode}>
	<div class="panel">
		<h2>Login</h2>
		{#if auth_message}
			<p class="auth">{auth_message}</p>
		{/if}
		{#if is_space}
			<p class="auth">
				If you are visiting a HuggingFace Space in Incognito mode, you must
				enable third party cookies.
			</p>
		{/if}
		{#if incorrect_credentials}
			<p class="creds">Incorrect Credentials</p>
		{/if}
		<Form>
			<Textbox
				label="username"
				lines={1}
				show_label={true}
				max_lines={1}
				mode="dynamic"
				on:submit={submit}
				bind:value={username}
			/>
			<Textbox
				label="password"
				lines={1}
				show_label={true}
				max_lines={1}
				mode="dynamic"
				type="password"
				on:submit={submit}
				bind:value={password}
			/>
		</Form>

		<Button
			size="lg"
			variant="primary"
			style={{ full_width: true }}
			on:click={submit}
		>
			Login
		</Button>
	</div>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: var(--color-background-primary);
		width: var(--size-full);
	}

	.panel {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		gap: var(--size-4);
		border-radius: var(--radius-lg);
		background: var(--color-background-secondary);
		padding: var(--size-8);
		width: var(--size-full);
	}

	h2 {
		margin-bottom: var(--size-3);
		color: var(--color-text-body);
		font-weight: var(--weight-semibold);
		font-size: var(--scale-2);
	}

	.auth {
		margin-top: var(--size-1);
		margin-bottom: var(--size-1);
		color: var(--color-text-body);
	}

	.creds {
		margin-top: var(--size-4);
		margin-bottom: var(--size-4);
		color: var(--color-functional-error-base);
		font-weight: var(--weight-semibold);
	}
</style>

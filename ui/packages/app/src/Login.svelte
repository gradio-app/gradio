<script lang="ts">
	import { Component as Form } from "./components/Form";
	import { Component as Textbox } from "./components/Textbox";
	import { Button } from "@gradio/button";
	import { Component as Column } from "./components/Column";
	export let root: string;
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
	<Column variant="panel" min_width={480}>
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
	</Column>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: var(--size-3);
		background: var(--background-primary);
		width: var(--size-full);
	}

	h2 {
		margin-bottom: var(--size-3);
		color: var(--body-text-color);
		font-weight: var(--header-text-weight);
		font-size: var(--text-xl);
	}

	.auth {
		margin-top: var(--size-1);
		margin-bottom: var(--size-1);
		color: var(--body-text-color);
	}

	.creds {
		margin-top: var(--size-4);
		margin-bottom: var(--size-4);
		color: var(--error-color);
		font-weight: var(--weight-semibold);
	}
</style>

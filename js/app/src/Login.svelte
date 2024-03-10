<script lang="ts">
	import Form from "@gradio/form";
	import { BaseTextbox as Textbox } from "@gradio/textbox";
	import { BaseButton } from "@gradio/button";
	import Column from "@gradio/column";
	import { Block } from "@gradio/atoms";
	import { _ } from "svelte-i18n";
	export let root: string;
	export let auth_message: string | null;
	export let app_mode: boolean;
	export let space_id: string | null;

	let username = "";
	let password = "";
	let incorrect_credentials = false;

	const submit = async (): Promise<void> => {
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
		<h2>{$_("login.login")}</h2>
		{#if auth_message}
			<p class="auth">{@html auth_message}</p>
		{/if}
		{#if space_id}
			<p class="auth">
				{$_("login.enable_cookies")}
			</p>
		{/if}
		{#if incorrect_credentials}
			<p class="creds">{$_("login.incorrect_credentials")}</p>
		{/if}
		<Form>
			<Block>
				<Textbox
					label="username"
					lines={1}
					show_label={true}
					max_lines={1}
					on:submit={submit}
					bind:value={username}
				/>
			</Block>

			<Block>
				<Textbox
					label="password"
					lines={1}
					show_label={true}
					max_lines={1}
					type="password"
					on:submit={submit}
					bind:value={password}
				/>
			</Block>
		</Form>

		<BaseButton size="lg" variant="primary" on:click={submit}
			>{$_("login.login")}</BaseButton
		>
	</Column>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: var(--size-3);
		background: var(--background-fill-primary);
		width: var(--size-full);
	}

	h2 {
		margin-bottom: var(--size-3);
		color: var(--body-text-color);
		font-weight: var(--section-header-text-weight);
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
		color: var(--error-text-color);
		font-weight: var(--weight-semibold);
	}
</style>

<script lang="ts">
	import { Component as Form } from "./components/Form";
	import { Component as Textbox } from "./components/Textbox";
	export let root: string;
	export let id: number;
	export let auth_message: string | null;
	export let app_mode: boolean;

	window.__gradio_loader__[id].$set({ status: "complete" });
	let username = "";
	let password = "";
	let incorrect_credentials = false;

	const submit = async () => {
		const formData = new FormData();
		formData.append("username", username);
		formData.append("password", password);

		let response = await fetch(root + "login", {
			method: "POST",
			body: formData
		});
		if (response.status === 400) {
			incorrect_credentials = true;
			username = "";
			password = "";
		} else {
			location.reload();
		}
	};
</script>

<div
	class="dark:bg-gray-950 w-full flex flex-col items-center justify-center"
	class:min-h-screen={app_mode}
>
	<div class="gr-panel !p-8">
		<h2 class="text-2xl font-semibold mb-6">Login</h2>
		{#if auth_message}
			<p class="my-4">{auth_message}</p>
		{/if}
		{#if incorrect_credentials}
			<p class="my-4 text-red-600 font-semibold">Incorrect Credentials</p>
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

		<button
			class="gr-button gr-button-lg gr-button-primary w-full mt-4"
			on:click={submit}
		>
			Login
		</button>
	</div>
</div>

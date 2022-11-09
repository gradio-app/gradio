<script lang="ts">
	export let root: string;
	export let id: number;
	export let auth_message: string | null;

	let username: string;
	let password: string;

	let incorrect_credentials = false;
	const submit = async () => {
		incorrect_credentials = false;
		let formData = new FormData();
		formData.append("username", username);
		formData.append("password", password);

		var res = await fetch(root + "login", {
			method: "POST",
			body: formData,
		});
		if (res.status == 400) {
			incorrect_credentials = true;
			username = "";
			password = "";
		} else if (res.status == 200) {
			var res_json = await res.json();
			document.cookie = "access-token=" + res_json["token"];
			window.setTimeout(() => location.reload(), 10000)
		}
		console.log(res.status);
	};

	window.__gradio_loader__[id].$set({ status: "complete" });
</script>

<div class="login container mt-8">
	<form
		class="mx-auto p-4 bg-gray-50 shadow-md w-1/2"
		id="login"
		action="javascript:void(0);"
		on:submit={submit}
	>
		<h2 class="text-2xl font-semibold my-2">login</h2>
		{#if auth_message}
			<p class="my-4">{auth_message}</p>
		{/if}
		{#if incorrect_credentials}
			<p class="mt-4 font-bold text-red-600">Incorrect Credentials</p>
		{/if}
		<label class="block uppercase mt-4" for="username">username</label>
		<input
			class="p-2 block"
			type="text"
			name="username"
			bind:value={username}
		/>
		<label class="block uppercase mt-4" for="password">password</label>
		<input
			class="p-2 block"
			type="password"
			name="password"
			bind:value={password}
		/>
		<input
			type="submit"
			class="block bg-amber-500 hover:bg-amber-400 dark:hover:bg-amber-600 transition px-4 py-2 rounded text-white font-semibold cursor-pointer mt-4"
		/>
	</form>
</div>

<script lang="ts">
	export let root: string;
	export let id: number;
	export let auth_message: string | null;

	window.__gradio_loader__[id].$set({ status: "complete" });
</script>

<div class="login container mt-8">
	<form
		class="mx-auto p-4 bg-gray-100 shadow-md w-1/2"
		id="login"
		method="POST"
		action={root + "login"}
	>
		<h2 class="text-2xl font-semibold my-2">login</h2>
		{#if auth_message}
			<p class="my-4">{auth_message}</p>
		{/if}
		<label class="block uppercase mt-4" for="username">username</label>
		<input class="p-2 block" type="text" name="username" />
		<label class="block uppercase mt-4" for="password">password</label>
		<input class="p-2 block" type="password" name="password" />
		<input
			type="submit"
			class="block bg-amber-600 hover:bg-amber-400 dark:hover:bg-amber-600 transition px-4 py-2 rounded text-white font-semibold cursor-pointer mt-4"
		/>
	</form>
</div>

<script>
	import { client } from '@gradio/client';
	import EndpointInputs from '../../lib/EndpointInputs.svelte';
	import ResponsePreview from '../../lib/ResponsePreview.svelte';

	let api = '';
	let hf_token = '';

	/**
	 * @type Awaited<ReturnType<typeof client>>
	 */
	let app;
	/**
	 * @type any
	 */
	let app_info;
	/**
	 * @type string[]
	 */
	let named = [];
	/**
	 * @type string[]
	 */
	let unnamed = [];
	let active_endpoint = '';
	/**
	 *  @type {{data: any[]}}
	 */
	let response_data = { data: [] };
	/**
	 * @type any[]
	 */
	let request_data = [];
	async function connect() {
		if (!api || (hf_token && !hf_token.startsWith('_hf'))) return;

		app = await client(api, {
			//@ts-ignore
			hf_token: hf_token
		});

		const { named_endpoints, unnamed_endpoints } = await app.view_api();

		named = Object.keys(named_endpoints);
		unnamed = Object.keys(unnamed_endpoints);
	}

	/**
	 * @param type {"named" | "unnamed"}
	 * @param _endpoint {string}
	 */
	async function select_endpoint(type, _endpoint) {
		const _endpoint_info = (await app.view_api())?.[`${type}_endpoints`]?.[_endpoint];
		if (!_endpoint_info) return;

		app_info = _endpoint_info;
		active_endpoint = _endpoint;
	}

	async function submit() {
		const res = await app.predict(active_endpoint, request_data);
		console.log(res);
		response_data = res;
	}
</script>

<h2>Client Browser</h2>

<p>
	Enter a space <code>user-space/name</code> to test the client in a browser environment with any space.
</p>
<p>You may optionally provide a <code>hf_token</code> to test a private space</p>

<div class="input-wrap">
	<label for="">
		<span>Space Name</span>
		<input type="text" placeholder="user/space-name" bind:value={api} />
	</label>

	<label for="">
		<span>Hugging Face Token <i>(optional)</i></span>
		<input type="text" placeholder="hf_..." bind:value={hf_token} />
	</label>
</div>

<button on:click={connect}>Connect</button>

{#if named.length || unnamed.length}
	<div class="endpoints">
		<div class="endpoint">
			<h3>Named endpoints</h3>
			{#if named.length}
				{#each named as endpoint}
					<button
						class:selected={endpoint === active_endpoint}
						on:click={() => select_endpoint('named', endpoint)}>{endpoint}</button
					>
				{/each}
			{:else}
				<p>There are no named endpoints</p>
			{/if}
		</div>

		<div class="endpoint">
			<h3>Unnamed endpoints</h3>
			{#if unnamed.length}
				{#each unnamed as endpoint}
					<button
						class:selected={endpoint === active_endpoint}
						on:click={() => select_endpoint('unnamed', endpoint)}>{endpoint}</button
					>
				{/each}
			{:else}
				<p>There are no unnamed endpoints</p>
			{/if}
		</div>
	</div>
{/if}

{#if app_info}
	<div class="app_info">
		<div>
			<EndpointInputs app_info={app_info.parameters} bind:request_data />
			<button class="submit" on:click={submit}>Submit Request</button>
		</div>
		<div>
			<ResponsePreview app_info={app_info.returns} {response_data} />
		</div>
	</div>
{/if}

<style>
	label {
		display: flex;
		flex-direction: column;
		width: 100%;
		gap: var(--size-1);
	}

	label:first-child input {
		border-top-left-radius: 2px;

		margin-right: -1px;
	}

	label:last-child input {
		border-top-right-radius: 2px;
	}

	input {
		border-radius: 0px;
		outline: none;
		border-bottom: none;
	}

	input:focus-visible {
		border-color: var(--color-accent);
		z-index: 1;
	}

	.input-wrap {
		display: flex;
		margin-top: var(--size-6);
	}

	button {
		border-bottom-right-radius: 2px;
		border-bottom-left-radius: 2px;
		background: var(--color-accent);
		padding: var(--size-2) var(--size-2-5);
		color: var(--background-fill-primary);
		font-size: var(--scale-0);
		width: 100%;
		font-weight: bold;
		/* margin-top: var(--size-3); */
	}

	.endpoints button {
		width: auto;
		background: var(--color-orange-200);
		color: var(--body-text-color);
	}
	button.selected {
		background: var(--color-accent);
		color: white;
	}

	.endpoints {
		display: flex;
		gap: var(--size-10);
		margin-top: var(--size-10);
	}

	.endpoint {
		width: 100%;
	}

	.app_info {
		display: flex;
		gap: var(--size-10);
		margin-top: var(--size-10);
	}

	.app_info > div {
		width: 100%;
	}
	.submit {
		margin-top: var(--size-5);
	}
</style>

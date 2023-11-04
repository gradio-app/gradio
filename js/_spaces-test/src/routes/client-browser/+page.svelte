<script>
	import { client } from "@gradio/client";
	import EndpointInputs from "../../lib/EndpointInputs.svelte";
	import ResponsePreview from "../../lib/ResponsePreview.svelte";

	let api = "gradio/cancel_events";
	let hf_token = "";

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
	/**
	 * @type string | number
	 */
	let active_endpoint = "";
	/**
	 *  @type {{data: any[]; fn_index: number; endpoint: string|number}}
	 */
	let response_data = { data: [], fn_index: 0, endpoint: "" };
	/**
	 * @type any[]
	 */
	let request_data = [];
	async function connect() {
		named = [];
		unnamed = [];
		app_info = undefined;
		active_endpoint = "";
		response_data = { data: [], fn_index: 0, endpoint: "" };
		if (!api || (hf_token && !hf_token.startsWith("_hf"))) return;

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
		response_data = { data: [], fn_index: 0, endpoint: "" };
		const _endpoint_info = (await app.view_api())?.[`${type}_endpoints`]?.[
			type === "unnamed" ? parseInt(_endpoint) : _endpoint
		];
		if (!_endpoint_info) return;

		app_info = _endpoint_info;
		active_endpoint = type === "unnamed" ? parseInt(_endpoint) : _endpoint;
	}

	/**
	 * @type ReturnType<Awaited<ReturnType<typeof client>>["submit"]>
	 */
	let job;

	/**
	 * @type {"pending" | "error" | "complete" | "generating" | 'idle'}
	 */
	let status = "idle";

	async function submit() {
		response_data = { data: [], fn_index: 0, endpoint: "" };

		job = app
			.submit(active_endpoint, request_data)
			.on("data", (data) => {
				response_data = data;
			})
			.on("status", (_status) => {
				status = _status.stage;
			});
	}

	function cancel() {
		job.cancel();
	}

	let endpoint_type_text = "";
	$: {
		if (!app_info) {
			endpoint_type_text = "";
		} else if (!app_info.type.continuos && app_info.type.generator) {
			endpoint_type_text =
				"This endpoint generates values over time and can be cancelled.";
		} else if (app_info.type.continuos && app_info.type.generator) {
			endpoint_type_text =
				"This endpoint generates values over time and will continue to yield values until cancelled.";
		} else {
			endpoint_type_text = "This endpoint runs once and cannot be cancelled.";
		}
	}
</script>

<h2>Client Browser</h2>

<p>
	Enter a space <code>user-space/name</code> to test the client in a browser environment
	with any space.
</p>
<p>
	You may optionally provide a <code>hf_token</code> to test a private space
</p>

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
						class="endpoint-button"
						class:selected={endpoint === active_endpoint}
						on:click={() => select_endpoint("named", endpoint)}
						>{endpoint}</button
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
						class="endpoint-button"
						class:selected={parseInt(endpoint) === active_endpoint}
						on:click={() => select_endpoint("unnamed", endpoint)}
						>{endpoint}</button
					>
				{/each}
			{:else}
				<p>There are no unnamed endpoints</p>
			{/if}
		</div>
	</div>
{/if}

{#if app_info}
	<hr />
	<p>
		This endpoint accepts {app_info.parameters.length
			? app_info.parameters.length
			: "no"} piece{app_info.parameters.length < 1 ||
		app_info.parameters.length > 1
			? "s"
			: ""} of data and returns {app_info.returns.length
			? app_info.returns.length
			: "no"} piece{app_info.returns.length < 1 || app_info.returns.length > 1
			? "s"
			: ""} of data. {endpoint_type_text}
	</p>
	<hr />
	<div class="app_info">
		<div>
			<EndpointInputs app_info={app_info.parameters} bind:request_data />
			<button class="submit" on:click={submit}>Submit Request</button>
			{#if app_info.type.generator || app_info.type.continuous}
				<button
					class="cancel"
					on:click={cancel}
					disabled={status !== "generating" && status !== "pending"}
					>Cancel Request</button
				>
			{/if}
		</div>
		<div>
			<ResponsePreview {status} app_info={app_info.returns} {response_data} />
		</div>
	</div>
{/if}

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		width: 100%;
	}

	label:first-child input {
		margin-right: -1px;
		border-top-left-radius: 2px;
	}

	label:last-child input {
		border-top-right-radius: 2px;
	}

	input {
		outline: none;
		border-bottom: none;
		border-radius: 0px;
	}

	input:focus-visible {
		z-index: 1;
		border-color: var(--color-accent);
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
		width: 100%;
		color: var(--background-fill-primary);
		font-weight: bold;
		font-size: var(--scale-0);
		/* margin-top: var(--size-3); */
	}

	.endpoints button {
		background: var(--color-orange-200);
		width: auto;
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

	hr {
		margin: var(--size-6) 0;
	}

	.cancel {
		margin-top: var(--size-2);
		background-color: var(--color-red-600);
	}
	.endpoint-button {
		margin-right: var(--size-1);
		border-radius: 2px;
	}

	button[disabled] {
		opacity: 0.2;
	}
</style>

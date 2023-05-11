<script>
	import Spinner from "./Spinner.svelte";
	import Warning from "./Warning.svelte";
	import Success from "./Success.svelte";
	/**
	 * @type {{data: any[]}}
	 */
	export let response_data = { data: [] };
	/**
	 * @type {{type: string; label: string; component:string}[]}
	 */
	export let app_info;

	/**
	 * @type {"pending" | "error" | "complete" | "generating" | 'idle'}
	 */
	export let status = "idle";
</script>

<div>
	<div class="heading-wrap">
		<h3>Response Outputs</h3>
		{#if status === "pending" || status === "generating"}
			<Spinner />
		{:else if status === "error"}
			<Warning />
		{:else if status === "complete"}
			<Success />
		{/if}
	</div>
	{#each app_info as { type, label, component }, i}
		{#if type === "string"}
			<label for="">
				<span>{label} <code>{type}</code></span>
				<input type="text" disabled value={response_data.data[i] || ""} />
			</label>
		{:else if type === "number"}
			<label for="">
				<span>{label} <code>{type}</code></span>
				<input type="number" disabled value={response_data.data[i] || ""} />
			</label>
		{:else if type === "boolean"}
			<label for="">
				<span>{label} <code>{type}</code></span>
				<input type="checkbox" disabled value={response_data.data[i] || ""} />
			</label>
		{:else if type === "number"}
			<label for="">
				<span>{label} <code>{type}</code></span>
				<input type="number" disabled value={response_data.data[i] || ""} />
			</label>
		{:else if type === "string[]"}
			<label for="">
				<span>{label} <code>{type} - comma separated list</code></span>
				<input type="text" disabled value={response_data.data[i] || ""} />
			</label>
		{/if}
	{/each}

	<h4>JSON</h4>
	<pre><code
			>{JSON.stringify(
				response_data.data.length ? response_data : {},
				null,
				2
			)}</code
		></pre>
</div>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
		width: 100%;
	}

	input {
		outline: none;
		border-radius: 2px;
	}

	input:focus-visible {
		border-color: var(--color-accent);
	}

	.heading-wrap {
		display: flex;
	}
</style>

<script>
	/**
	 * @type {{type: string; label: string; component:string}[]}
	 */
	export let app_info;

	/**
	 * @type any[]
	 */
	export let request_data = [];

	/**
	 *
	 * @param files {FileList|null}
	 * @param i {number}
	 */
	function handle_file(files, i) {
		if (!files) return;
		const _files = Array.from(files);
		request_data[i] = files.length === 1 ? _files[0] : _files;
	}
</script>

<h3>Request Inputs</h3>

{#each app_info as { type, label, component }, i}
	{#if type === "string"}
		<label for="">
			<span>{label} <code>{type}</code></span>
			<input type="text" bind:value={request_data[i]} />
		</label>
	{:else if type === "number"}
		<label for="">
			<span>{label} <code>{type}</code></span>
			<input type="number" bind:value={request_data[i]} />
		</label>
	{:else if type === "boolean"}
		<label for="">
			<span>{label} <code>{type}</code></span>
			<input type="checkbox" bind:value={request_data[i]} />
		</label>
	{:else if type === "number"}
		<label for="">
			<span>{label} <code>{type}</code></span>
			<input type="number" bind:value={request_data[i]} />
		</label>
	{:else if type === "string[]"}
		<label for="">
			<span>{label} <code>{type} - comma separated list</code></span>
			<input
				type="text"
				value={request_data[i]}
				on:input={(e) =>
					(request_data[i] = e.currentTarget.value
						.split(",")
						.map((v) => v.trim()))}
			/>
		</label>
	{:else if ["Image", "Audio", "Video"].includes(component)}
		<label for="">
			<span>{label} <code>File</code></span>
			<input
				type="file"
				on:input={(e) => handle_file(e.currentTarget.files, i)}
			/>
		</label>
	{/if}
{/each}

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
</style>

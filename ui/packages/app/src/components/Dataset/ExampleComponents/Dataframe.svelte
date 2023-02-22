<script lang="ts">
	//@ts-ignore
	import { csvParseRows, tsvParseRows } from "d3-dsv";

	export let value: Array<Array<string | number>> | string;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected: boolean = false;
	export let index: number;

	let hovered = false;
	let loaded_value: Array<Array<string | number>> | string = value;
	let loaded = Array.isArray(loaded_value);

	$: if (!loaded && typeof value === "string" && /\.[a-zA-Z]+$/.test(value)) {
		fetch(samples_dir + value)
			.then((v) => v.text())
			.then((v) => {
				try {
					if ((value as string).endsWith("csv")) {
						const small_df = v
							.split("\n")
							.slice(0, 4)
							.map((v) => v.split(",").slice(0, 4).join(","))
							.join("\n");

						loaded_value = csvParseRows(small_df);
					} else if ((value as string).endsWith("tsv")) {
						const small_df = v
							.split("\n")
							.slice(0, 4)
							.map((v) => v.split("\t").slice(0, 4).join("\t"))
							.join("\n");

						loaded_value = tsvParseRows(small_df);
					} else {
						throw new Error(
							"Incorrect format, only CSV and TSV files are supported"
						);
					}

					loaded = true;
				} catch (e) {
					console.error(e);
				}
			})
			.catch((e) => {
				loaded_value = value;
				loaded = true;
			});
	}
</script>

{#if loaded}
	<div
		class:table={type === "table"}
		class:gallery={type === "gallery"}
		class:selected
		on:mouseenter={() => (hovered = true)}
		on:mouseleave={() => (hovered = false)}
	>
		{#if typeof loaded_value === "string"}
			{loaded_value}
		{:else}
			<table class="">
				{#each loaded_value.slice(0, 3) as row, i}
					<tr>
						{#each row.slice(0, 3) as cell, j}
							<td>{cell}</td>
						{/each}
						{#if row.length > 3}
							<td>…</td>
						{/if}
					</tr>
				{/each}
				{#if value.length > 3}
					<div
						class="overlay"
						class:odd={index % 2 != 0}
						class:even={index % 2 == 0}
						class:button={type === "gallery"}
					/>
				{/if}
			</table>
		{/if}
	</div>
{/if}

<style>
	.gallery {
		align-items: center;
		cursor: pointer;
		border-collapse: collapse;
		padding: var(--size-2);
		overflow: hidden;
		font-size: var(--scale-000);
		line-height: var(--line-sm);
		text-align: left;
	}

	table {
		position: relative;
	}

	td {
		border: 1px solid var(--color-border-tertiary);
		padding: var(--size-2);
		font-size: var(--scale-000);
		font-family: var(--font-mono);
	}

	.table.selected td {
		border-color: var(--color-border-tertiary);
	}

	.gallery.selected td {
		border-color: var(--color-border-tertiary);
	}

	td:first-child {
		border-left: none;
	}

	tr:first-child td {
		border-top: none;
	}

	td:last-child {
		border-right: none;
	}

	tr:last-child td {
		border-bottom: none;
	}

	.overlay {
		--gradient-to: transparent;
		position: absolute;
		bottom: 0;
		background: linear-gradient(to bottom, transparent, var(--gradient-to));
		width: var(--size-full);
		height: 50%;
	}

	/* i dont know what i've done here but it is what it is */
	.odd {
		--gradient-to: var(--table-even-background);
	}

	.even {
		--gradient-to: var(--table-odd-background);
	}

	.button {
		--gradient-to: var(--color-background-primary);
	}

	.selected .even,
	.selected .odd {
		--gradient-to: var(--color-focus-ring);
	}

	.selected .button {
		--gradient-to: var(--color-focus-ring);
	}
</style>

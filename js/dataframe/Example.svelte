<script lang="ts">
	import { csvParseRows, tsvParseRows } from "d3-dsv";
	import type { Gradio } from "@gradio/utils";

	export let gradio: Gradio;
	export let value: (string | number)[][] | string;
	export let samples_dir: string;
	export let type: "gallery" | "table";
	export let selected = false;
	export let index: number;

	let hovered = false;
	let loaded_value: (string | number)[][] | string = value;
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
						throw new Error(gradio.i18n("dataframe.incorrect_format"));
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
	<!-- TODO: fix-->
	<!-- svelte-ignore a11y-no-static-element-interactions-->
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
	table {
		position: relative;
	}

	td {
		border: 1px solid var(--table-border-color);
		padding: var(--size-2);
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}

	.selected td {
		border-color: var(--border-color-accent);
	}

	.table {
		display: inline-block;
		margin: 0 auto;
	}

	.gallery td:first-child {
		border-left: none;
	}

	.gallery tr:first-child td {
		border-top: none;
	}

	.gallery td:last-child {
		border-right: none;
	}

	.gallery tr:last-child td {
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
		--gradient-to: var(--table-even-background-fill);
	}

	.even {
		--gradient-to: var(--table-odd-background-fill);
	}

	.button {
		--gradient-to: var(--background-fill-primary);
	}
</style>

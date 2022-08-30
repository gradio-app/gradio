<script lang="ts">
	//@ts-ignore
	import { csvParseRows, tsvParseRows } from "d3-dsv";
	export let value: Array<Array<string | number>> | string;
	export let samples_dir: string;
	let hovered = false;
	let loaded = Array.isArray(value);

	$: if (!loaded && typeof value === "string" && /\.[a-zA-Z]+$/.test(value)) {
		fetch(samples_dir + value)
			.then((v) => v.text())
			.then((v) => {
				try {
					if ((value as string).endsWith("csv")) {
						value = csvParseRows(v);
					} else if ((value as string).endsWith("tsv")) {
						tsvParseRows(value);
					} else {
						throw new Error(
							"Incorrect format, only CSV and TSV files are supported"
						);
					}

					loaded = true;
				} catch (e) {
					console.error(e);
				}
			});
	}
</script>

{#if loaded}
	<div
		class="gr-sample-dataframe"
		on:mouseenter={() => (hovered = true)}
		on:mouseleave={() => (hovered = false)}
	>
		<table class="gr-sample-dataframe relative">
			{#each value.slice(0, 3) as row, i}
				<tr>
					{#each row.slice(0, 3) as cell, j}
						<td
							class="p-2 {i < 3 ? 'border-b border-b-slate-700' : ''} 
							{j < 3 ? 'border-r border-r-slate-700 ' : ''}">{cell}</td
						>
					{/each}
					{#if row.length > 3}
						<td
							class="p-2  border-r border-b border-r-slate-700 border-b-slate-700"
							>…</td
						>
					{/if}
				</tr>
			{/each}
			{#if value.length > 3}
				<div
					class="absolute w-full h-[50%] bottom-0 bg-gradient-to-b from-transparent to-slate-900"
					class:to-slate-800={hovered}
				/>
			{/if}
			<!--	{#if value[0].length > 3}
			<div
				class="absolute h-full w-[50%] right-0 top-0 bg-gradient-to-r from-transparent to-slate-900"
				class:to-slate-800={hovered}
			/>
		{/if} -->
		</table>
	</div>
{/if}

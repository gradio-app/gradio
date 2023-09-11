<script lang="ts">
	export let value: (string | number)[][];
</script>

<table class="input-dataframe-example">
	{#each value.slice(0, 3) as row}
		<tr>
			{#each row.slice(0, 3) as cell}
				<td class="p-2">{cell}</td>
			{/each}
			{#if row.length > 3}
				<td class="p-2">...</td>
			{/if}
		</tr>
	{/each}
	{#if value.length > 3}
		<tr>
			{#each Array(Math.min(4, value[0].length)) as _}
				<td class="p-2">...</td>
			{/each}
		</tr>
	{/if}
</table>

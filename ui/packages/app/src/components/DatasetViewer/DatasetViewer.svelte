<script lang="ts">
	export let types: Array<string>;
	export let headers: Array<string>;
	export let value: Array<Array<any>>;

	export let theme: string;
	export let style: string | null;
</script>

<table>
	<thead>
		{#each headers as header}
			<th>{header}</th>
		{/each}
	</thead>
</table>

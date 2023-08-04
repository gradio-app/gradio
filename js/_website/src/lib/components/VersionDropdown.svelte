<script lang="ts">
	export let choices: string[];
	export let value: string;
</script>

<select bind:value>
	{#each choices as choice}
		<option value={choice}>{choice}</option>
	{/each}
</select>

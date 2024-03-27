<script lang="ts">
    export let api_calls = [];  
</script>

<div id="api-recorder">
    🟥 <span style="font-style: italic;">Recording API Calls...</span> ({api_calls.length})
</div>

<style>
	#api-recorder {
		border: 1px solid var(--color-accent);
		background-color: var(--color-accent-soft);
		padding: 0px var(--size-2);
		border-radius: var(--size-1);
		cursor: pointer;        
	}    
</style>

<script lang="ts">
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
</script>

<div class="z-50 top-0 right-0 flex justify-end m-1 flex gap-1 absolute">
	<button
		class="bg-opacity-30 hover:bg-opacity-100 transition p-1.5 bg-yellow-500 dark:bg-red-600 rounded shadow w-8 h-8"
		on:click={() => dispatch("undo")}
	>
		<img alt="undo sketch" src="/static/img/undo-solid.svg" />
	</button>
	<button
		class="clear bg-opacity-30 hover:bg-opacity-100 transition p-1 bg-gray-50 dark:bg-gray-500 rounded shadow w-8 h-8"
		on:click={() => dispatch("clear")}
	>
		<img alt="clear sketch" src="static/img/clear.svg" />
	</button>
</div>

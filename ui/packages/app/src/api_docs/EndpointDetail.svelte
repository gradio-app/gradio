<script lang="ts">
	export let api_name: string;
	export let root: string;
	export let dependency_index: number;

	let just_copied = -1;
</script>

<h3 class="text-lg font-bold mb-1.5">
	<span
		class="bg-orange-100 px-1 rounded text-sm border border-orange-200 mr-2 font-semibold text-orange-600 dark:bg-orange-400 dark:text-orange-900 dark:border-orange-600"
		>POST</span
	>
	/run/{api_name}
</h3>
<div class="text-sm md:text-base mb-6 text-gray-500">
	Endpoint: <span class="underline">{root}run/{api_name}</span>
	<button
		class="gr-button ml-2 !py-0"
		on:click={() => {
			navigator.clipboard.writeText(root + "run/" + api_name);
			just_copied = dependency_index;
			setTimeout(() => {
				just_copied = -1;
			}, 500);
		}}
	>
		{#if just_copied === dependency_index}copied!{:else}copy{/if}
	</button>
</div>

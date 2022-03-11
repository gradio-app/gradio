<script>
	import Pane from "./Pane.svelte";
	export let component_id_map,
		children,
		type,
		values,
		setValues,
		triggerTarget,
		theme,
		static_src;

	let selected_tab = 0;
	console.log("tabs", children);
</script>

<div class="flex flex-col">
	<div class="flex">
		{#each children as child, i}
			{#if i === selected_tab}
				<button
					class="px-4 py-2 font-semibold border-2 border-b-0 rounded-t border-gray-200"
				>
					{child.name}
				</button>
			{:else}
				<button
					class="px-4 py-2 border-b-2 border-gray-200"
					on:click={() => {
						selected_tab = i;
					}}
				>
					{child.name}
				</button>
			{/if}
		{/each}
		<div class="flex-1 border-b-2 border-gray-200" />
	</div>
	{#each children as child, i}
		<div
			class="p-2 border-2 border-t-0 border-gray-200"
			class:hidden={i !== selected_tab}
		>
			<Pane
				{component_id_map}
				{...child}
				{values}
				{setValues}
				{triggerTarget}
				{static_src}
				{theme}
			/>
		</div>
	{/each}
</div>

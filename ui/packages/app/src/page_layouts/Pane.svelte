<script>
	import TabSet from "./TabSet.svelte";
	import { all_components_map } from "../components/directory";

	export let component_id_map,
		children,
		dependencies,
		type,
		values,
		setValues,
		triggerTarget,
		theme,
		static_src;
</script>

<div class="flex gap-4" class:flex-col={type !== "row"}>
	{#each children as child}
		{#if typeof child === "object"}
			{#if child.type === "tabset"}
				<TabSet
					{component_id_map}
					{...child}
					{values}
					{setValues}
					{triggerTarget}
					{static_src}
					{theme}
				/>
			{:else}
				<svelte:self
					{component_id_map}
					{...child}
					{values}
					{setValues}
					{triggerTarget}
					{static_src}
					{theme}
				/>
			{/if}
		{:else if !(component_id_map[child].type === "output" && values[child] === null)}
			<div class:flex-1={type === "row"} on:click={() => triggerTarget(child)}>
				<svelte:component
					this={all_components_map[component_id_map[child].type][
						component_id_map[child].props.name
					].component}
					value={values[child]}
					setValue={setValues.bind(this, child)}
					{...component_id_map[child].props}
					{static_src}
					{theme}
				/>
			</div>
		{/if}
	{/each}
</div>

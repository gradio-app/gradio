<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import JSON from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/JSON",
		component: JSON
	});

	const example_json = {
		items: {
			item: [
				{
					id: "0001",
					type: null,
					is_good: false,
					ppu: 0.55,
					batters: {
						batter: [{ id: "1001", type: "Regular" }]
					},
					topping: [{ id: "5002", type: "Glazed" }]
				}
			]
		}
	};

	const example_arr = [
		"first item",
		"second item",
		"third item",
		{ name: "fourth item", type: "object" },
		["nested", "array", "example"]
	];
</script>

<Story name="Default JSON" args={{}}>
	{#snippet template(args)}
		<JSON {...wrapProps({ value: example_json, ...args })} />
	{/snippet}
</Story>

<Story
	name="with show_indices and height"
	args={{ value: example_json, show_indices: true, height: 200 }}
>
	{#snippet template(args)}
		<JSON {...wrapProps({ value: example_json, ...args })} />
	{/snippet}
</Story>

<Story
	name="with array and show_indices"
	args={{ value: example_arr, show_indices: true, open: true }}
>
	{#snippet template(args)}
		<JSON {...wrapProps(args)} />
	{/snippet}
</Story>

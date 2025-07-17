<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import JSON from "./Index.svelte";
	import { userEvent, within } from "@storybook/test";

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

	export const meta = {
		title: "Components/JSON",
		component: JSON
	};
</script>

<Template let:args>
	<JSON value={example_json} {...args} />
</Template>

<Story name="Default JSON" args={{}} />

<Story
	name="with interactivity"
	args={{
		value: example_json,
		interactive: true
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		const toggles = within(canvasElement).getAllByRole("button");
		await userEvent.click(toggles[1]);
		await userEvent.click(toggles[1]);

		await userEvent.click(toggles[2]);
		await userEvent.click(canvas.getAllByText("Object(2)")[0]);
	}}
/>

<Story
	name="with show_indices and height"
	args={{
		value: example_json,
		show_indices: true,
		height: 200
	}}
/>

<Story
	name="with array and show_indices"
	args={{
		value: example_arr,
		show_indices: true,
		open: true
	}}
/>

<Story
	name="with array and hidden indices"
	args={{
		value: example_arr,
		show_indices: false,
		open: true
	}}
/>

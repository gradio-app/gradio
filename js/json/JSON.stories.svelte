<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import JSON from "./Index.svelte";
	import { userEvent, within } from "@storybook/test";

	const SAMPLE_JSON = {
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

	export const meta = {
		title: "Components/JSON",
		component: JSON
	};
</script>

<Template let:args>
	<JSON value={SAMPLE_JSON} {...args} />
</Template>

<Story name="Default JSON" args={{}} />

<Story
	name="JSON Interactions"
	args={{
		value: SAMPLE_JSON,
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
	name="JSON viewed as list with height"
	args={{
		value: SAMPLE_JSON,
		show_indices: true,
		height: 200
	}}
/>

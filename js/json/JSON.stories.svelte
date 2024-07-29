<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import JSON from "./Index.svelte";
	import { userEvent, within } from "@storybook/test";
	import { allModes } from "../storybook/modes";

	const SAMPLE_JSON = {
		key1: "value1",
		key2: "value2",
		key3: {
			key4: "value4",
			key5: "value5"
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
		await userEvent.click(canvas.getByText("Object(2)"));
	}}
/>

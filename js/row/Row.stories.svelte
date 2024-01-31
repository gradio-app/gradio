<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Row from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Layout Elements/Row",
		component: Row,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	};
</script>

<Template let:args>
	<Row {...args}>
		<Button elem_id="btn" size="lg">test</Button>
		<Button elem_id="btn" size="lg">test</Button>
	</Row>
</Template>

<Story name="Row Layout" />

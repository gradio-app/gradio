<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Dropdown from "./shared/Dropdown.svelte";
	import { allModes } from "../storybook/modes";

	const { Story } = defineMeta({
		title: "Components/Dropdown",
		component: Dropdown,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		},
		argTypes: {
			label: {
				control: "text",
				description: "The dropdown label"
			},
			info: {
				control: "text",
				description: "Additional info text"
			},
			multiselect: {
				control: "boolean",
				description: "Whether to allow multiple selections"
			},
			disabled: {
				control: "boolean",
				description: "Whether the dropdown is disabled"
			}
		}
	});
</script>

{#snippet template(args)}
	<Dropdown {...args} />
{/snippet}

<Story name="Single-select" args={{ value: "swim", choices: [["run", "run"], ["swim", "swim"], ["jump", "jump"]], label: "Single-select Dropdown", info: "This is a single-select dropdown" }} {template} />
<Story name="Single-select Static" args={{ value: "swim", choices: [["run", "run"], ["swim", "swim"], ["jump", "jump"]], disabled: true, label: "Single-select Dropdown" }} {template} />
<Story name="Empty initial value" args={{ interactive: true, choices: [["run", "run"], ["swim", "swim"], ["jump", "jump"]], label: "Empty Dropdown" }} {template} />
<Story name="With many options" args={{ value: "python", choices: [["Python", "python"], ["JavaScript", "javascript"], ["TypeScript", "typescript"], ["Java", "java"], ["C++", "cpp"], ["Go", "go"], ["Rust", "rust"], ["Ruby", "ruby"]], label: "Programming Language" }} {template} />

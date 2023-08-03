<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Dropdown from "./Dropdown.svelte";
</script>

<Meta
	title="Components/Dropdown"
	component={Dropdown}
	argTypes={{
        multiselect: {
            control: [true, false],
            description: "Whether to autoplay the video on load",
			name: "multiselect",
			value: false
        }
     }}
/>

<Template let:args>
	<Dropdown {...args} />
</Template>

<Story name="Default" args={{ value:"swim", choices:["run", "swim", "jump"], label:"Dropdown"}} />
<Story name="Multiselect" args={{ value:["swim", "run"], choices:["run", "swim", "jump"], label:"Multiselect Dropdown", multiselect:true}} />
<Story name="Multiselect Static" args={{ value:["swim", "run"], choices:["run", "swim", "jump"], label:"Multiselect Dropdown", multiselect:true, disabled:true}} />


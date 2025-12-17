<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Walkthrough from "./shared/Walkthrough.svelte";
</script>

<Meta title="Components/Walkthrough" component={Walkthrough} />

<Template let:args>
	<Walkthrough {...args} />
</Template>

<Story name="Walkthrough Default" args={{}} />

<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Row from "./Index.svelte";
	import Button from "../button/shared/Button.svelte";
</script>

<Meta title="Layout Elements/Row" component={Row} />

<Template let:args>
	<Row {...args}>
		<Button elem_id="btn" size="lg">test</Button>
		<Button elem_id="btn" size="lg">test</Button>
	</Row>
</Template>

<Story name="Row Layout" />

<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Row from "./Index.svelte";
	import Image from "@gradio/image";
</script>

<Meta title="Layout Elements/Row" component={Row} />

<Template let:args>
	<Row {...args}>
		<Image
			{...args}
			value={{ name: "https://i.ibb.co/6BgKdSj/groot.jpg", is_file: true }}
		/>
		<Image
			{...args}
			value={{ name: "https://i.ibb.co/6BgKdSj/groot.jpg", is_file: true }}
		/>
	</Row>
</Template>

<Story name="Row" />

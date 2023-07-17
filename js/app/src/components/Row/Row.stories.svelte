<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Row from "./Row.svelte";
    import Image from '../Image/Image.svelte';
</script>

<Meta
	title="Layout Elements/Row"
	component={Row}
/>

<Template let:args>
    <Row {...args}>
        <Image {...args} value="https://i.ibb.co/6BgKdSj/groot.jpg" />
        <Image {...args} value="https://i.ibb.co/6BgKdSj/groot.jpg" />
    </Row>
</Template>

<Story name="Row" />
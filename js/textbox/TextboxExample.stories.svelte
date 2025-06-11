<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Textbox from "./Example.svelte";
</script>

<Meta title="Components/Textbox/Example" component={Textbox} />

<Template let:args>
	<Textbox {...args} />
</Template>

<Story
	name="Text value"
	args={{
		value: "the quick brown fox"
	}}
/>

<Story
	name="Null"
	args={{
		value: null
	}}
/>

<Story
	name="Long text truncated at 60 chars"
	args={{
		value: [
			`[00:04.34]Tell me that I'm special\n[00:06.57]Tell me I look pretty\n[00:08.46]Tell me I'm a little angel\n[00:10.58]Sweetheart of your city\n[00:13.64]Say what I'm dying to hear\n[00:17.35]Cause I'm dying to hear you\n[00:20.86]Tell me I'm that new thing\n[00:22.93]Tell me that I'm relevant\n[00:24.96]Tell me that I got a big heart\n[00:27.04]Then back it up with evidence\n[00:29.94]I need it and I don't know why\n[00:34.28]This late at night\n[00:36.32]Isn't it lonely\n[00:39.24]I'd do anything to make you want me\n[00:43.40]I'd give it all up if you told me\n[00:47.42]That I'd be\n[00:49.43]The number one girl in your eyes\n[00:52.85]Your one and only\n[00:55.74]So what's it gon' take for you to want me\n[00:59.78]I'd give it all up if you told me\n[01:03.89]That I'd be\n[01:05.94]The number one girl in your eyes\n[01:11.34]Tell me I'm going real big places\n[01:14.32]Down to earth so friendly\n[01:16.30]And even through all the phases\n[01:18.46]Tell me you accept me\n[01:21.56]Well that's all I'm dying to hear\n[01:25.30]Yeah I'm dying to hear you\n[01:28.91]Tell me that you need me\n[01:30.85]Tell me that I'm loved\n[01:32.90]Tell me that I'm worth it\n`
		]
	}}
/>

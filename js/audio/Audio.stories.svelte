<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import Audio from "./Index.svelte";
</script>

<Meta title="Components/Audio" component={Audio} />

<Template let:args>
	<Audio value="Audio" {...args} />
</Template>

<Story
	name="Audio Player"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		label: "Audio Player"
	}}
/>

<Story
	name="Audio Recorder"
	args={{
		value: null,
		interactive: true,
		sources: ["microphone"],
		label: "Audio Recorder"
	}}
/>

<Story
	name="Upload Audio"
	args={{
		value: null,
		interactive: true,
		sources: ["upload", "microphone"],
		label: "Audio Upload"
	}}
/>

<Story
	name="Audio with autoplay"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: true,
		sources: ["microphone", "upload"],
		label: "Audio Upload",
		autoplay: true
	}}
/>

<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Audio from "./Index.svelte";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Components/Audio",
		component: Audio,
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
	name="Audio Player without recording waveform"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		waveform_options: {
			show_recording_waveform: false
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
	name="Audio Recorder with download button"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: true,
		show_download_button: true,
		sources: ["microphone"],
		label: "Audio Recorder"
	}}
/>

<Story
	name="output with hidden download button"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: false,
		show_download_button: false,
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
	name="with autoplay"
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

<Story
	name="upload with disabled editing"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: true,
		sources: ["microphone", "upload"],
		label: "Audio Upload",
		editable: false
	}}
/>

<Story
	name="with hidden recording waveform"
	args={{
		value: null,
		interactive: true,
		sources: ["microphone"],
		waveform_options: {
			show_recording_waveform: false
		}
	}}
/>

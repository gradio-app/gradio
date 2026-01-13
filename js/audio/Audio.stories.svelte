<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Audio from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/Audio",
		component: Audio,
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
				description: "The audio component label"
			},
			interactive: {
				control: "boolean",
				description: "Whether the component is interactive"
			}
		}
	});
</script>

{#snippet template(args)}
	<Audio {...wrapProps(args)} />
{/snippet}

<Story
	name="Audio Player"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		label: "Audio Player",
		waveform_options: { show_recording_waveform: true },
		sources: ["upload", "microphone"]
	}}
	{template}
/>
<Story
	name="Audio Player without recording waveform"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		waveform_options: { show_recording_waveform: false },
		label: "Audio Player",
		sources: ["upload", "microphone"]
	}}
	{template}
/>
<Story
	name="Audio Recorder"
	args={{
		value: null,
		interactive: true,
		sources: ["microphone"],
		label: "Audio Recorder",
		waveform_options: { show_recording_waveform: true }
	}}
	{template}
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
		buttons: ["download"],
		sources: ["microphone"],
		label: "Audio Recorder",
		waveform_options: { show_recording_waveform: true }
	}}
	{template}
/>
<Story
	name="Output with hidden download button"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: false,
		buttons: [],
		label: "Audio Recorder",
		waveform_options: { show_recording_waveform: true },
		sources: ["upload"]
	}}
	{template}
/>
<Story
	name="Upload Audio"
	args={{
		value: null,
		interactive: true,
		sources: ["upload", "microphone"],
		label: "Audio Upload",
		waveform_options: { show_recording_waveform: true }
	}}
	{template}
/>
<Story
	name="With autoplay"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: true,
		sources: ["microphone", "upload"],
		label: "Audio Upload",
		autoplay: true,
		waveform_options: { show_recording_waveform: true }
	}}
	{template}
/>
<Story
	name="Upload with disabled editing"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: true,
		sources: ["microphone", "upload"],
		label: "Audio Upload",
		editable: false,
		waveform_options: { show_recording_waveform: true }
	}}
	{template}
/>
<Story
	name="With hidden recording waveform"
	args={{
		value: null,
		interactive: true,
		sources: ["microphone"],
		waveform_options: { show_recording_waveform: false },
		label: "Audio Recorder"
	}}
	{template}
/>

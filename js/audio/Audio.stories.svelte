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
			},
			show_download_button: {
				control: "boolean",
				description: "Whether to show download button"
			}
		}
	});
</script>

<Story
	name="Audio Player"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		label: "Audio Player",
		waveform_options: {
			show_recording_waveform: true
		},
		sources: ["upload", "microphone"]
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

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
		label: "Audio Player",
		sources: ["upload", "microphone"]
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Audio Recorder"
	args={{
		value: null,
		interactive: true,
		sources: ["microphone"],
		label: "Audio Recorder",
		waveform_options: {
			show_recording_waveform: true
		}
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

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
		label: "Audio Recorder",
		waveform_options: {
			show_recording_waveform: true
		}
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Output with hidden download button"
	args={{
		value: {
			path: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			url: "https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3",
			orig_name: "sample-0.mp3"
		},
		interactive: false,
		show_download_button: false,
		label: "Audio Recorder",
		waveform_options: {
			show_recording_waveform: true
		},
		sources: ["upload"]
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="Upload Audio"
	args={{
		value: null,
		interactive: true,
		sources: ["upload", "microphone"],
		label: "Audio Upload",
		waveform_options: {
			show_recording_waveform: true
		}
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

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
		waveform_options: {
			show_recording_waveform: true
		}
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

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
		waveform_options: {
			show_recording_waveform: true
		}
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

<Story
	name="With hidden recording waveform"
	args={{
		value: null,
		interactive: true,
		sources: ["microphone"],
		waveform_options: {
			show_recording_waveform: false
		},
		label: "Audio Recorder"
	}}
>
	{#snippet template(args)}
		<Audio {...wrapProps(args)} />
	{/snippet}
</Story>

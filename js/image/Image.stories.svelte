<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { expect, userEvent, waitFor, within } from "storybook/test";
	import StaticImage from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { wrapProps } from "../storybook/wrapProps";

	const cheetah = "/cheetah.jpg";
	const lion = "/lion.jpg";

	const { Story } = defineMeta({
		title: "Components/Image",
		component: StaticImage,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	});

	let md = `# a heading! /n a new line! `;
</script>

<Story
	name="static with label, info and download button"
	args={{
		value: {
			path: cheetah,
			url: cheetah,
			orig_name: "cheetah.jpg"
		},
		show_label: true,
		placeholder: "This is a cheetah",
		buttons: ["fullscreen", "download"],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="static with no label or download button"
	args={{
		value: {
			path: cheetah,
			url: cheetah,
			orig_name: "cheetah.jpg"
		},
		show_label: false,
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="static with a vertically long image"
	args={{
		value: {
			path: lion,
			url: lion,
			orig_name: "lion.jpg"
		},
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="static with a vertically long image and a fixed height"
	args={{
		value: {
			path: lion,
			url: lion,
			orig_name: "lion.jpg"
		},
		height: "500px",
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="static with a small image and a fixed height"
	args={{
		value: {
			path: cheetah,
			url: cheetah,
			orig_name: "cheetah.jpg"
		},
		height: "500px",
		buttons: [],
		webcam_options: { mirror: true, constraints: null }
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="interactive with webcam"
	args={{
		sources: ["webcam"],
		interactive: true,
		label: "Camera",
		buttons: ["download"],
		webcam_options: { mirror: true, constraints: null }
	}}
	play={async ({ canvasElement }) => {
		const media_devices_descriptor = Object.getOwnPropertyDescriptor(
			navigator,
			"mediaDevices"
		);
		const play_descriptor = Object.getOwnPropertyDescriptor(
			HTMLMediaElement.prototype,
			"play"
		);

		try {
			const stream = new MediaStream();
			Object.defineProperty(stream, "getTracks", {
				value: () => [
					{
						getSettings: () => ({ deviceId: "front-camera" }),
						stop: () => {}
					}
				]
			});
			Object.defineProperty(navigator, "mediaDevices", {
				configurable: true,
				value: {
					getUserMedia: async () => stream,
					enumerateDevices: async () => [
						{
							deviceId: "front-camera",
							groupId: "mobile-cameras",
							kind: "videoinput",
							label: "Front camera"
						},
						{
							deviceId: "rear-camera",
							groupId: "mobile-cameras",
							kind: "videoinput",
							label: "Rear camera"
						}
					]
				}
			});
			Object.defineProperty(HTMLMediaElement.prototype, "play", {
				configurable: true,
				value: async () => {}
			});

			const canvas = within(canvasElement);
			await userEvent.click(
				canvas.getByRole("button", { name: "Click to Access Webcam" })
			);
			await waitFor(() => {
				expect(
					canvas.getByRole("button", { name: "capture photo" })
				).toBeInTheDocument();
				expect(
					canvas.getByRole("button", { name: "select input source" })
				).toBeInTheDocument();
			});
		} finally {
			if (media_devices_descriptor) {
				Object.defineProperty(
					navigator,
					"mediaDevices",
					media_devices_descriptor
				);
			} else {
				Reflect.deleteProperty(navigator, "mediaDevices");
			}

			if (play_descriptor) {
				Object.defineProperty(
					HTMLMediaElement.prototype,
					"play",
					play_descriptor
				);
			} else {
				Reflect.deleteProperty(HTMLMediaElement.prototype, "play");
			}
		}
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 360px; height: 440px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<Story
	name="interactive with clipboard"
	args={{
		sources: ["clipboard"],
		interactive: true,
		buttons: ["download"]
	}}
>
	{#snippet template(args)}
		<div
			class="image-container"
			style="width: 300px; position: relative;border-radius: var(--radius-lg);overflow: hidden;"
		>
			<StaticImage {...wrapProps(args)} />
		</div>
	{/snippet}
</Story>

<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Gallery from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { within } from "@testing-library/dom";
	import { userEvent } from "storybook/test";
	import { wrapProps } from "../storybook/wrapProps";

	const cheetah = "/cheetah.jpg";
	const lion = "/lion.jpg";
	const bus = "/bus.png";
	const video_sample = "/video_sample.mp4";

	const { Story } = defineMeta({
		title: "Components/Gallery",
		component: Gallery,
		argTypes: {
			label: {
				control: "text",
				description: "The gallery label",
				name: "label",
				value: "Gradio Button"
			},
			show_label: {
				options: [true, false],
				description: "Whether to show the label",
				control: { type: "boolean" },
				defaultValue: true
			},
			columns: {
				options: [1, 2, 3, 4],
				description: "The number of columns to show in grid",
				control: { type: "select" },
				defaultValue: 2
			},
			rows: {
				options: [1, 2, 3, 4],
				description: "The number of rows to show in grid",
				control: { type: "select" },
				defaultValue: 2
			},
			height: {
				options: ["auto", 200, 500, 600],
				description: "The height of the grid",
				control: { type: "select" },
				defaultValue: "auto"
			},
			preview: {
				options: [true, false],
				description: "Whether to start the gallery in preview mode",
				control: { type: "boolean" },
				defaultValue: true
			},
			allow_preview: {
				options: [true, false],
				description: "Whether to allow a preview mode in the gallery",
				control: { type: "boolean" },
				defaultValue: true
			},
			object_fit: {
				options: ["contain", "cover", "fill", "none", "scale-down"],
				description: "How to display each indivial image in the grid",
				control: { type: "select" },
				defaultValue: "contain"
			},
			show_share_button: {
				options: [true, false],
				description: "Whether to show the share button in the gallery",
				control: { type: "boolean" },
				defaultValue: false
			},
			fit_columns: {
				options: [true, false],
				description:
					"Whether the columns should fit the width of the container",
				control: { type: "boolean" },
				defaultValue: true
			}
		},
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		}
	});

	const galleryValue = [
		{
			image: {
				path: cheetah,
				url: cheetah,
				orig_name: "cheetah.jpg"
			},
			caption: "A fast cheetah"
		},
		{
			video: {
				path: video_sample,
				url: video_sample,
				orig_name: "video_sample.mp4"
			},
			caption: "Sample video"
		},
		{
			image: {
				path: lion,
				url: lion,
				orig_name: "lion.jpg"
			}
		},
		{
			image: {
				path: bus,
				url: bus,
				orig_name: "bus.png"
			}
		},
		{
			image: {
				path: cheetah,
				url: cheetah,
				orig_name: "cheetah.jpg"
			}
		},
		{
			image: {
				path: lion,
				url: lion,
				orig_name: "lion.jpg"
			}
		},
		{
			image: {
				path: bus,
				url: bus,
				orig_name: "bus.png"
			}
		},
		{
			image: {
				path: cheetah,
				url: cheetah,
				orig_name: "cheetah.jpg"
			}
		}
	];
</script>

<Story
	name="Gallery with label"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		buttons: ["fullscreen", "download", "share"]
	}}
	play={async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const image = canvas.getByLabelText("Thumbnail 1 of 8");
		await userEvent.click(image);
		const expand_btn = canvas.getByRole("button", { name: "Fullscreen" });
		await userEvent.click(expand_btn);
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery without label"
	args={{ label: "My Cheetah Gallery", show_label: false, buttons: [] }}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with rows=3 and columns=3"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		rows: 3,
		columns: 3,
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with columns=4"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		columns: 4,
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with height=600"
	args={{ label: "My Cheetah Gallery", height: 600, buttons: [] }}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with allow_preview=false"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		allow_preview: false,
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with preview"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		preview: true,
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with object_fit=scale-down"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "scale-down",
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with object_fit=contain"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "contain",
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with object_fit=cover"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "cover",
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with object_fit=none"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "none",
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with object_fit=fill"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		object_fit: "fill",
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with share button"
	args={{ label: "My Cheetah Gallery", show_label: true, buttons: ["share"] }}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with overflow of images"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		rows: 2,
		columns: 2,
		height: 400,
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with overflow of images and short height"
	args={{
		label: "My Cheetah Gallery",
		show_label: true,
		rows: 2,
		columns: 2,
		height: 200,
		buttons: []
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with download button"
	args={{
		label: "My Cheetah Gallery",
		rows: 2,
		height: 400,
		buttons: ["download"]
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with fit_columns false"
	args={{
		label: "My Cheetah Gallery",
		columns: 10,
		buttons: ["download"],
		fit_columns: false
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story
	name="Gallery with fit_columns true"
	args={{
		label: "My Cheetah Gallery",
		columns: 10,
		buttons: ["download"],
		fit_columns: true
	}}
>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

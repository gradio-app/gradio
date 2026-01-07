<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import Gallery from "./Index.svelte";
	import { allModes } from "../storybook/modes";
	import { within } from "@testing-library/dom";
	import { userEvent } from "storybook/test";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
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
	});

	const galleryValue = [
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah_running.avif",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah_running.avif",
				orig_name: "cheetah_running.avif"
			},
			caption: "A fast cheetah"
		},
		{
			video: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/world.mp4",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/world.mp4",
				orig_name: "world.mp4"
			},
			caption: "The world"
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
				orig_name: "cheetah-002.jpg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-003.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-003.jpg",
				orig_name: "cheetah-003.jpg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah3.webp",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah3.webp",
				orig_name: "cheetah3.webp"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
				orig_name: "ghepardo-primo-piano.jpg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq.jpeg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq.jpeg",
				orig_name: "main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq.jpeg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/TheCheethcat.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/TheCheethcat.jpg",
				orig_name: "TheCheethcat.jpg"
			}
		}
	];
</script>
	const galleryValue = [
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah_running.avif",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah_running.avif",
				orig_name: "cheetah_running.avif"
			},
			caption: "A fast cheetah"
		},
		{
			video: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/world.mp4",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/world.mp4",
				orig_name: "world.mp4"
			},
			caption: "The world"
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
				orig_name: "cheetah-002.jpg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-003.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-003.jpg",
				orig_name: "cheetah-003.jpg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah3.webp",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah3.webp",
				orig_name: "cheetah3.webp"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/ghepardo-primo-piano.jpg",
				orig_name: "ghepardo-primo-piano.jpg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq.jpeg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq.jpeg",
				orig_name: "main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq.jpeg"
			}
		},
		{
			image: {
				path: "https://gradio-builds.s3.amazonaws.com/demo-files/TheCheethcat.jpg",
				url: "https://gradio-builds.s3.amazonaws.com/demo-files/TheCheethcat.jpg",
				orig_name: "TheCheethcat.jpg"
			}
		}
	];
</script>

<Story name="Gallery with label" args={{ label: "My Cheetah Gallery", show_label: true, buttons: ["fullscreen", "download", "share"] }} play={async ({ canvasElement }) => {
	const canvas = within(canvasElement);
	const image = canvas.getByLabelText("Thumbnail 1 of 8");
	await userEvent.click(image);
	const expand_btn = canvas.getByRole("button", { name: "Fullscreen" });
	await userEvent.click(expand_btn);
}}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery without label" args={{ label: "My Cheetah Gallery", show_label: false, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with rows=3 and columns=3" args={{ label: "My Cheetah Gallery", show_label: true, rows: 3, columns: 3, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with columns=4" args={{ label: "My Cheetah Gallery", show_label: true, columns: 4, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with height=600" args={{ label: "My Cheetah Gallery", height: 600, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with allow_preview=false" args={{ label: "My Cheetah Gallery", show_label: true, allow_preview: false, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with preview" args={{ label: "My Cheetah Gallery", show_label: true, preview: true, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with object_fit=scale-down" args={{ label: "My Cheetah Gallery", show_label: true, object_fit: "scale-down", buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with object_fit=contain" args={{ label: "My Cheetah Gallery", show_label: true, object_fit: "contain", buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with object_fit=cover" args={{ label: "My Cheetah Gallery", show_label: true, object_fit: "cover", buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with object_fit=none" args={{ label: "My Cheetah Gallery", show_label: true, object_fit: "none", buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with object_fit=fill" args={{ label: "My Cheetah Gallery", show_label: true, object_fit: "fill", buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with share button" args={{ label: "My Cheetah Gallery", show_label: true, buttons: ["share"] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with overflow of images" args={{ label: "My Cheetah Gallery", show_label: true, rows: 2, columns: 2, height: 400, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with overflow of images and short height" args={{ label: "My Cheetah Gallery", show_label: true, rows: 2, columns: 2, height: 200, buttons: [] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with download button" args={{ label: "My Cheetah Gallery", rows: 2, height: 400, buttons: ["download"] }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with fit_columns false" args={{ label: "My Cheetah Gallery", columns: 10, buttons: ["download"], fit_columns: false }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

<Story name="Gallery with fit_columns true" args={{ label: "My Cheetah Gallery", columns: 10, buttons: ["download"], fit_columns: true }}>
	{#snippet template(args)}
		<Gallery {...wrapProps({ value: galleryValue, ...args })} />
	{/snippet}
</Story>

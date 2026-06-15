<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
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
		buttons: ["download"],
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


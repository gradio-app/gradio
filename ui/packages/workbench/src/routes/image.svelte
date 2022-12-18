<script lang="ts">
	import img from "../assets/cheetah1.jpg";
	import { browser } from "$app/env";
	import { Image, StaticImage } from "@gradio/image";
	import { Block } from "@gradio/atoms";

	const src = `<h1>hello</h1>`;
</script>

{#if browser}
	<Block>
		<Image
			label="Editor with upload"
			value={null}
			source={"upload"}
			tool="editor"
		/>
	</Block>
	<span />
	<Block>
		<Image
			label="Editor with webcam"
			value={null}
			source={"webcam"}
			tool="editor"
		/>
	</Block>
	<span />
	<Block>
		<Image
			label="Editor with sketch"
			value={null}
			source={"canvas"}
			tool="editor"
		/>
	</Block>
	<span />
	<Block>
		<Image
			label="Editor with color sketch"
			value={null}
			source={"canvas"}
			tool="color-sketch"
		/>
	</Block>

	<span />

	<Block>
		<Image
			label="Editor with cropper"
			value={null}
			source={"upload"}
			tool="select"
		/>
	</Block>

	<span />

	<Block>
		<StaticImage label="Static - no value" value={null} />
	</Block>

	<span />

	<Block padding={false}>
		<StaticImage label="Static - with value" value={img} />
	</Block>
{/if}

<style>
	span {
		display: block;
		height: 1rem;
	}
</style>

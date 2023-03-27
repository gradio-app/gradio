<script lang="ts">
	import img from "../assets/cheetah1.jpg";
	import { browser } from "$app/env";
	import { Image, StaticImage } from "@gradio/image";
	import { Block } from "@gradio/atoms";

	const src = `<h1>hello</h1>`;
</script>

{#if browser}
	<Block padding={false}>
		<Image
			label="Editor with upload"
			value={null}
			source={"upload"}
			tool="editor"
		>
			<div class="flex flex-col">
				drop
				<span class="text-gray-300">- or -</span>
				upload
			</div>
		</Image>
	</Block>
	<span />
	<Block padding={false}>
		<Image
			label="Editor with webcam"
			value={null}
			source={"webcam"}
			tool="editor"
		/>
	</Block>
	<span />
	<Block padding={false}>
		<Image
			label="Editor with sketch"
			value={null}
			source={"canvas"}
			tool="editor"
		/>
	</Block>
	<span />
	<Block padding={false}>
		<Image
			label="Editor with color sketch"
			value={null}
			source={"canvas"}
			tool="color-sketch"
		/>
	</Block>

	<span />

	<Block padding={false}>
		<Image
			label="Editor with cropper"
			value={null}
			source={"upload"}
			tool="select"
		>
			<div class="flex flex-col">
				drop
				<span class="text-gray-300">- or -</span>
				upload
			</div>
		</Image>
	</Block>

	<span />

	<Block padding={false}>
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

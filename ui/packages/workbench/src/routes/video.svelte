<script lang="ts">
	import { Block } from "@gradio/atoms";
	import { Video, StaticVideo } from "@gradio/video";
</script>

<Block padding={false}>
	<Video label="Video - upload" value={null} source={"upload"} />
</Block>

<span />

<Block padding={false}>
	<Video label="Video webcam" value={null} source={"webcam"} />
</Block>

<span />

<Block padding={false}>
	<StaticVideo value={null} label="Static Video - no value" />
</Block>

<span />
<Block padding={false}>
	<StaticVideo value="asd" label="Static Video - with value" />
</Block>
<span />

<style>
	span {
		display: block;
		height: 1rem;
	}
</style>

<script lang="ts">
	import { Block } from "@gradio/atoms";
	import { Video, StaticVideo } from "@gradio/video";
</script>

<Block padding={false}>
	<Video label="Video - upload" value={null} source={"upload"}>
		<div class="flex flex-col">
			drop
			<span class="text-gray-300">- or -</span>
			upload
		</div>
	</Video>
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
	<StaticVideo
		value={{
			data: "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
			name: "sample"
		}}
		label="Static Video - with value"
	/>
</Block>
<span />

<style>
	span {
		display: block;
		height: 1rem;
	}
</style>

<script lang="ts">
	import { Audio, StaticAudio } from "@gradio/audio";
	import { Block } from "@gradio/atoms";
</script>

<Block variant={"dashed"} color={"grey"} padding={false}>
	<Audio label="Dynamic Audio" source="microphone">
		<div class="flex flex-col">
			drop
			<span class="text-gray-300">- or -</span>
			upload
		</div>
	</Audio>
</Block>
<span />
<Block variant={"dashed"} color={"grey"} padding={false}>
	<Audio label="Dynamic Audio" source="upload" value={null}>
		<div class="flex flex-col">
			drop
			<span class="text-gray-300">- or -</span>
			upload
		</div>
	</Audio>
</Block>

<span />
<Block variant={"solid"} color={"grey"} padding={false}>
	<StaticAudio name={"audio_file"} label="Static Audio - no vadatalue" />
</Block>

<span />

<Block variant={"solid"} color={"grey"} padding={false}>
	<StaticAudio
		name={"audio_file"}
		label="Static Audio - with data"
		value={{ name: "myfile.wav", data: "asd" }}
	/>
</Block>

<style>
	span {
		display: block;
		height: 1rem;
	}
</style>

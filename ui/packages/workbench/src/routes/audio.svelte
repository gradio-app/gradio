<script lang="ts">
	import { Audio, StaticAudio } from "@gradio/audio";
	import { Block } from "@gradio/atoms";
</script>

<Block variant={"dashed"} color={"grey"} padding={false}>
	<Audio
		label="Dynamic Audio"
		drop_text={"interface.drop_audio"}
		or_text={"or"}
		upload_text={"interface.click_to_upload"}
		source="microphone"
	/>
</Block>
<span />
<Block variant={"dashed"} color={"grey"} padding={false}>
	<Audio
		label="Dynamic Audio"
		drop_text={"interface.drop_audio"}
		or_text={"or"}
		upload_text={"interface.click_to_upload"}
		source="upload"
	/>
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

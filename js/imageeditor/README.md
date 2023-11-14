# `@gradio/imageeditor`

```svelte
<script>
	import {
		ImageEditor,
		Tools,
		Draw,
		Erase,
		Crop,
		Sources,
		UploadSource,
		PasteSource,
		WebcamSource,
		ColorSource
	} from "@gradio/button";
</script>

<ImageEditor bind:value={EditorData}>
	<Sources bind:value={File} active={}>
		<UploadSource />
		<PasteSource />
		<WebcamSource mirror_webcam={boolean}/>
		<ColorSource swatch={Array<Color>} current_color={Color} />
	</Sources>

	<Tools active_tool={Tool}>
		<Crop 
			fixed={Boolean} 
			current_crop={[x, y, size]} 
			default_crop={[x, y, size]} 
		/>
		<Draw 
			swatch={Array<Color>}
			fixed={Boolean} 
			current_color={Color} 
			sizes={Array<Size>} 
			current_size={Size} 
		/>
		<Erase sizes={Array<Size>} current_size={Size} />
	</Tools>
</ImageEditor>
```

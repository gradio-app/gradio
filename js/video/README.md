# `@gradio/video`

```javascript
<script>
	import { BaseInteractiveVideo, BaseStaticVideo, BasePlayer } from "@gradio/button";
	import type { FileData } from "@gradio/upload";
	import type { Gradio } from "@gradio/utils";
	export let _video: FileData;
</script>

<StaticVideo
	value={_video}
	{label}
	{show_label}
	{autoplay}
	{show_share_button}
	i18n={gradio.i18n}
/>

<Video
	value={_video}
	{label}
	{show_label}
	source={"upload"}
	{mirror_webcam}
	{include_audio}
	{autoplay}
	i18n={gradio.i18n}
>
	<p>Upload Video Here</p>
</Video>

<BasePlayer
	src={value.data}
	{autoplay}
	on:play
	on:pause
	on:stop
	on:end
	mirror={false}
	{label}
/>
```

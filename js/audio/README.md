# `@gradio/audio`

```html
<script>
	import { BaseStaticAudio, BaseInteractiveAudio, BasePlayer, BaseExample } from "@gradio/audio";
</script>
```


BaseExample:
```javascript
	export let value: string;
	export let type: "gallery" | "table";
	export let selected = false;
```

BaseStaticAudio:
```javascript
	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let name: string;
	export let show_label = true;
	export let autoplay: boolean;
	export let show_download_button = true;
	export let show_share_button = false;
	export let i18n: I18nFormatter;
	export let waveform_settings = {};
```

BaseInteractiveAudio:
```javascript
	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let root: string;
	export let show_label = true;
	export let sources:
		| ["microphone"]
		| ["upload"]
		| ["microphone", "upload"]
		| ["upload", "microphone"] = ["microphone", "upload"];
	export let pending = false;
	export let streaming = false;
	export let autoplay = false;
	export let i18n: I18nFormatter;
	export let waveform_settings = {};
	export let dragging: boolean;
	export let active_source: "microphone" | "upload";
	export let handle_reset_value: () => void = () => {};
```

BasePlayer:
```javascript
	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let autoplay: boolean;
	export let i18n: I18nFormatter;
	export let dispatch: (event: any, detail?: any) => void;
	export let dispatch_blob: (
		blobs: Uint8Array[] | Blob[],
		event: "stream" | "change" | "stop_recording"
	) => Promise<void> = () => Promise.resolve();
	export let interactive = false;
	export let waveform_settings = {};
	export let mode = "";
	export let handle_reset_value: () => void = () => {};
```
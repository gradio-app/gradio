# `@gradio/statustracker`

```html
<script>
    import {StatusTracker, Toast, Loader} from `@gradio/statustracker`;
</script>
```

StatusTracker
```javascript
	export let i18n: I18nFormatter;
	export let eta: number | null = null;
	export let queue = false;
	export let queue_position: number | null;
	export let queue_size: number | null;
	export let status: "complete" | "pending" | "error" | "generating";
	export let scroll_to_output = false;
	export let timer = true;
	export let show_progress: "full" | "minimal" | "hidden" = "full";
	export let message: string | null = null;
	export let progress: LoadingStatus["progress"] | null | undefined = null;
	export let variant: "default" | "center" = "default";
	export let loading_text = "Loading...";
	export let absolute = true;
	export let translucent = false;
	export let border = false;
	export let autoscroll: boolean;
```

Toast
```javascript
	export let messages: ToastMessage[] = [];
```

Loader
```javascript
	export let margin = true;
```
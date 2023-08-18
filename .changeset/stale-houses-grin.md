---
"@gradio/app": minor
"gradio": minor
---

highlight:

#### Add `onloadcomplete` function to `<gradio-app>`

We now have an event `onloadcomplete` on the <gradio-app> web component, which is triggered once the embedded space has finished loading.

```html
<gradio-app
	space="gradio/live_with_vars"
	initial_height="0px"
	onloadcomplete="handleLoadComplete()"
></gradio-app>

...

<script>
	function handleLoadComplete() {
		console.log("Embedded space has finished loading");
	}
	const gradioApp = document.querySelector("gradio-app");
	gradioApp.addEventListener("onloadcomplete", handleLoadComplete);
</script>
```

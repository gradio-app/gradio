<script lang="ts">
	import { onMount } from "svelte";
	import iframeResize from "iframe-resizer";

	let gradio_container;
	let iframe: HTMLIFrameElement;

	onMount(() => {
		console.log({ iframeResize: iframeResize.iframeResize });
		import("@self/spa/webcomponent");
		gradio_container = document.querySelector("gradio-container");
		const iframe_resizer_attribute = "iframe-resizer";
		iframeResize.iframeResize(
			{
				heightCalculationMethod: "lowestElement",
				checkOrigin: false,
				warningTimeout: 0,
				scrolling: "omit",
				onInit: (iframe: HTMLIFrameElement) => {
					console.log("iframe resized", iframe);
					iframe.setAttribute(iframe_resizer_attribute, "");
					iframe.setAttribute("scrolling", "no");
					iframe.style.overflow = "hidden";
				}
			},
			iframe
		);

		setTimeout(() => {
			if (iframe.hasAttribute(iframe_resizer_attribute)) {
				return;
			}

			iframe.setAttribute("scrolling", "yes");
		}, 1000);
	});
</script>

<iframe
	src="http://localhost:9876/"
	bind:this={iframe}
	allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; clipboard-read; clipboard-write; display-capture; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; serial; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking"
	sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-storage-access-by-user-activation"
></iframe>

<style>
	iframe {
		width: 1px;
		min-width: 100%;
		flex: 1;
		border: none;
	}
</style>

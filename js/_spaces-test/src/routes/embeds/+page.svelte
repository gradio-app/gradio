<script lang="ts">
	import { onMount } from "svelte";
	import iframeResize from "iframe-resizer";

	let gradio_container;
	let iframe: HTMLIFrameElement;

	onMount(() => {
		import("@self/spa/webcomponent");
		gradio_container = document.querySelector("gradio-container");
		const iframe_resizer_attribute = "iframe-resizer";

		iframeResize.iframeResizer(
			{
				heightCalculationMethod: "lowestElement",
				checkOrigin: false,
				warningTimeout: 0,
				scrolling: false,
				onInit: (iframe: HTMLIFrameElement) => {
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

<div>
	<iframe
		src="http://localhost:9876/"
		bind:this={iframe}
		allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; clipboard-read; clipboard-write; display-capture; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; serial; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking"
		sandbox="allow-downloads allow-forms allow-modals allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-storage-access-by-user-activation"
	></iframe>
</div>

<style>
	div {
		display: flex;
		width: 100%;
		min-width: 100%;

		flex: 1;
		border: none;
		margin: 0;
	}

	iframe {
		width: 100%;
		border: none;
		flex-grow: 1;
		min-height: 100%;
	}
</style>

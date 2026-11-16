import { initialize_console_forwarding } from "@gradio/client";
import { untrack } from "svelte";

declare let GRADIO_VERSION_RAW: string;

// install before hydration so startup errors are captured too
if (window.__gradio_mode__ === "app") {
	initialize_console_forwarding({
		gradio_version: GRADIO_VERSION_RAW,
		untrack
	});
}

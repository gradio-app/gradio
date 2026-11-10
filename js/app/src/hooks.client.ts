import { initialize_console_forwarding } from "@gradio/client";

declare let GRADIO_VERSION_RAW: string;

// Start capturing console output before the app hydrates, so an embedding
// page that asks for it (the gradio-console protocol) also gets startup errors.
if (window.__gradio_mode__ === "app") {
	initialize_console_forwarding({ gradio_version: GRADIO_VERSION_RAW });
}

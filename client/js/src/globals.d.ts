import { Config } from "./types";

declare global {
	interface Window {
		__gradio_mode__: "app" | "website";
		gradio_config: Config;
		__is_colab__: boolean;
		__gradio_space__: string | null;
	}
}

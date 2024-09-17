import { ApiData, ApiInfo, Config } from "./types";

declare global {
	interface Window {
		__gradio_mode__: "app" | "website";
		gradio_config: Config;
		gradio_api_info: ApiInfo<ApiData> | { api: ApiInfo<ApiData> };
		__is_colab__: boolean;
		__gradio_space__: string | null;
	}
}

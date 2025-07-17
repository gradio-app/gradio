import { ApiData, ApiInfo } from "client/js/src/types";
declare global {
	interface Window {
		__gradio_mode__: "app" | "website";
		__gradio_space__: string | null;
		launchGradio: Function;
		launchGradioFromSpaces: Function;
		gradio_config: Config;
		gradio_api_info: ApiInfo<ApiData> | { api: ApiInfo<ApiData> };
		scoped_css_attach: (link: HTMLLinkElement) => void;
		__is_colab__: boolean;
		parentIFrame?: {
			scrollTo: (x: number, y: number) => void;
		};
		supports_zerogpu_headers?: boolean;
	}
}

export interface Config {
	auth_required?: true;
	auth_message: string;
	components: any[];
	css: string | null;
	dependencies: any[];
	dev_mode: boolean;
	enable_queue: boolean;
	layout: any;
	mode: "blocks" | "interface";
	root: string;
	theme: string;
	title: string;
	version: string;
	space_id: string | null;
	is_colab: boolean;
	show_api: boolean;
	stylesheets: string[];
	path: string;
	js: string | null;
	head: string | null;
	analytics_enabled: boolean;
	show_error: boolean;
	is_space: boolean;
	protocol: "ws" | "sse" | "sse_v1" | "sse_v2" | "sse_v2.1" | "sse_v3";
	theme_hash?: number;
	username: string | null;
	current_page: string;
}

declare global {
	interface Window {
		__gradio_mode__: "app" | "website";
		launchGradio: Function;
		launchGradioFromSpaces: Function;
		gradio_config: Config;
		scoped_css_attach: (link: HTMLLinkElement) => void;
		__is_colab__: boolean;
	}
}

export interface Config {
	auth_required: boolean | undefined;
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
}

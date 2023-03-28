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

export {};

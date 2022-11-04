declare global {
	interface Window {
		__gradio_mode__: "app" | "website";
		launchGradio: Function;
		launchGradioFromSpaces: Function;
		gradio_config: Config;
		scoped_css_attach: (link: HTMLLinkElement) => void;
		__gradio_loader__: Array<{
			$set: (args: any) => any;
		}>;
		__is_colab__: boolean;
	}
}

export {};

import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../../..");

export interface DemoConfig {
	max_file_size?: string;
	css_paths?: string[];
	head?: string;
	theme?: string;
}

export const DEMO_CONFIGS: Record<string, DemoConfig> = {
	upload_file_limit_test: {
		max_file_size: "15kb"
	},
	custom_css: {
		css_paths: [path.join(ROOT_DIR, "demo", "custom_css", "custom_css.css")]
	},
	theme_builder: {
		css_paths: [path.join(ROOT_DIR, "demo", "theme_builder", "custom_css.css")],
		head: "<style id='theme_css'></style>",
		theme: "gr.themes.Base()"
	}
};

export function getDemoConfig(demoName: string): DemoConfig | undefined {
	return DEMO_CONFIGS[demoName];
}

export { ROOT_DIR };

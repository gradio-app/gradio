export type ComponentCategory = "all" | "input" | "display" | "form";

export type ManifestEntry = {
	id: string;
	name: string;
	description: string;
	author: string;
	tags: string[];
	category: ComponentCategory;
	repo_url?: string;
};

export type HTMLComponentEntry = ManifestEntry & {
	html_template: string;
	css_template: string;
	js_on_load: string;
	default_props: Record<string, any>;
	python_code: string;
	head?: string;
};

export type ComponentCategory = "all" | "input" | "display" | "form";

export type HTMLComponentEntry = {
	id: string;
	name: string;
	description: string;
	author: string;
	tags: string[];
	category: ComponentCategory;
	html_template: string;
	css_template: string;
	js_on_load: string;
	default_props: Record<string, any>;
	python_code: string;
	repo_url?: string;
	head?: string;
};

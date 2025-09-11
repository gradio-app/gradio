import { writable } from "svelte/store";

export interface NavbarConfig {
	visible?: boolean;
	main_page_name?: string | false;
	value?: [string, string][] | null;
}

export const page_navbar_configs = writable<Record<string, NavbarConfig>>({});

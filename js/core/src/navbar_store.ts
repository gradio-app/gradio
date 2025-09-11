import { writable } from "svelte/store";

export interface NavbarConfig {
	visible?: boolean;
	main_page_name?: string | false;
	value?: [string, string][] | null;
}

export const navbar_config = writable<NavbarConfig | null>(null);

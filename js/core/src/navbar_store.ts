import { writable } from "svelte/store";

export interface NavbarConfig {
	visible?: boolean;
	home_page_title?: string;
}

export const navbar_config = writable<NavbarConfig | null>(null);

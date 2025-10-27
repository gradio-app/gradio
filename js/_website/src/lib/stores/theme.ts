import { writable, get } from "svelte/store";

export type Theme = "light" | "dark";

function get_initial_theme(): Theme {
	if (typeof window === "undefined") return "light";

	const stored = localStorage.getItem("theme") as Theme | null;
	if (stored) return stored;

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function apply_theme(theme: Theme): void {
	if (typeof window === "undefined") return;

	localStorage.setItem("theme", theme);
	document.documentElement.classList.toggle("dark", theme === "dark");
}

function createThemeStore() {
	const initial_theme = get_initial_theme();
	const store = writable<Theme>(initial_theme);
	const { subscribe, set } = store;

	apply_theme(initial_theme);

	return {
		subscribe,
		toggle: () => {
			const current = get(store);
			const new_theme: Theme = current === "light" ? "dark" : "light";
			apply_theme(new_theme);
			set(new_theme);
		},
		set: (theme: Theme) => {
			apply_theme(theme);
			set(theme);
		}
	};
}

export const theme = createThemeStore();

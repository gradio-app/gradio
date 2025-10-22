import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

// Get initial theme from localStorage or system preference
function getInitialTheme(): Theme {
	if (typeof window === 'undefined') return 'light';

	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored) return stored;

	// Check system preference
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}

	return 'light';
}

function createThemeStore() {
	const initialTheme = getInitialTheme();
	const store = writable<Theme>(initialTheme);
	const { subscribe, set } = store;

	// Apply initial theme class immediately if in browser
	if (typeof window !== 'undefined') {
		if (initialTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	return {
		subscribe,
		toggle: () => {
			const current = get(store);
			const newTheme: Theme = current === 'light' ? 'dark' : 'light';
			console.log('[Theme Store] Toggling from', current, 'to', newTheme);
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', newTheme);
				console.log('[Theme Store] Set localStorage to', newTheme);
				if (newTheme === 'dark') {
					document.documentElement.classList.add('dark');
					console.log('[Theme Store] Added dark class');
				} else {
					document.documentElement.classList.remove('dark');
					console.log('[Theme Store] Removed dark class');
				}
			}
			set(newTheme);
			console.log('[Theme Store] Updated store to', newTheme);
		},
		set: (theme: Theme) => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('theme', theme);
				if (theme === 'dark') {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			}
			set(theme);
		}
	};
}

export const theme = createThemeStore();

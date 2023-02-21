import { onDestroy } from "svelte";
import { writable } from "svelte/store";

const sizes = {
	sm: "(min-width: 640px)",
	md: "(min-width: 768px)",
	lg: "(min-width: 1024px)",
	xl: "(min-width: 1280px)",
	"2xl": "(min-width: 1536px)"
} as const;

const _default = {
	sm: false,
	md: false,
	lg: false,
	xl: false,
	"2xl": false
};

export const media_query = () => {
	const { subscribe, update } = writable(_default);

	const listeners: {
		[key: string]: [MediaQueryList, (ev: MediaQueryListEvent) => any];
	} = {};
	const onChange = (key: string) => () =>
		update((s) => ({ ...s, [key]: !!listeners[key][0].matches }));

	if (typeof window !== "undefined") {
		for (const key in sizes) {
			const mql = window.matchMedia(sizes[key as keyof typeof sizes]);
			const listener = onChange(key);

			mql.addEventListener("change", listener);

			listeners[key] = [mql, listener];
		}

		onDestroy(() => {
			for (const key in listeners) {
				const [_mql, _listener] = listeners[key];
				_mql.removeEventListener("change", _listener);
			}
		});
	}

	return { subscribe };
};
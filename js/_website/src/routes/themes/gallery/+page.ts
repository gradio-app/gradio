import type { ThemeData } from "./types";
import { BUILTIN_THEMES, fetch_community_themes } from "./utils";

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	let community_themes: ThemeData[] = [];
	try {
		community_themes = await fetch_community_themes(fetch);
	} catch {
		// fail silently — show builtins only
	}
	return { themes: [...BUILTIN_THEMES, ...community_themes] };
}

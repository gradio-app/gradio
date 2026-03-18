import type { ThemeData } from "./types";
import { BUILTIN_THEMES, fetch_community_themes } from "./utils";

async function fetch_likes(themes: ThemeData[]): Promise<void> {
	const with_spaces = themes.filter((t) => !t.is_official && t.hf_space_id);
	if (with_spaces.length === 0) return;

	const results = await Promise.allSettled(
		with_spaces.map((theme) =>
			fetch(`https://huggingface.co/api/spaces/${theme.hf_space_id}`)
				.then((r) => (r.ok ? r.json() : null))
				.then((data) => ({ id: theme.id, likes: data?.likes ?? 0 }))
				.catch(() => ({ id: theme.id, likes: 0 }))
		)
	);

	for (const result of results) {
		if (result.status === "fulfilled") {
			const match = themes.find((t) => t.id === result.value.id);
			if (match) match.likes = result.value.likes;
		}
	}
}

export async function load() {
	const community_themes = await fetch_community_themes();
	const all_themes = [...BUILTIN_THEMES, ...community_themes];
	await fetch_likes(all_themes);
	return { themes: all_themes };
}

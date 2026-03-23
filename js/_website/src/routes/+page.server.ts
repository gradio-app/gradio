import { logos, tweets } from "$lib/assets";

const STAR_COUNT_FALLBACK = 36_000;

export async function load({ fetch }: { fetch: typeof globalThis.fetch }) {
	let star_count = STAR_COUNT_FALLBACK;
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);
		const r = await fetch("https://api.github.com/repos/gradio-app/gradio", {
			signal: controller.signal
		});
		clearTimeout(timeout);
		const j = await r.json();
		star_count = j.stargazers_count;
	} catch {
		// timeout or network error — use fallback
	}

	return {
		logos,
		tweets,
		star_count
	};
}

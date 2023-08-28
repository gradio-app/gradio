import { logos, tweets } from "$lib/assets";

export async function load({ fetch }: any) {
	let r = await fetch("https://api.github.com/repos/gradio-app/gradio");
	let j = await r.json();
	let star_count = j.stargazers_count;

	return {
		logos,
		tweets,
		star_count
	};
}

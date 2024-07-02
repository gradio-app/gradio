import { create_pages_index, search_pages_index } from "./search";

addEventListener("message", async (e) => {
	const { type, payload } = e.data;

	if (type === "load") {
		const posts = await fetch("/search-api").then((res) => res.json());
		create_pages_index(posts);
		postMessage({ type: "ready" });
	}

	if (type === "search") {
		const search_term = payload.search_term;
		const results = search_pages_index(search_term);
		postMessage({ type: "results", payload: { results, search_term } });
	}
});

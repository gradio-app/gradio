import FlexSearch from "flexsearch";

export type Page = {
	content: string;
	slug: string;
	title: string;
	type: string;
};

export type Result = {
	content: string[];
	slug: string;
	title: string;
	type?: string;
};

let pages_index: FlexSearch.Index;
let pages: Page[];

export function create_pages_index(data: Page[]) {
	pages_index = new FlexSearch.Index({ tokenize: "forward" });

	data.forEach((page, i) => {
		const item = `${page.title} ${page.content}`;
		pages_index.add(i, item);
	});

	pages = data;
}

export function search_pages_index(search_term: string) {
	const match = search_term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const results = pages_index.search(match);
	return results
		.map((index) => pages[index as number])
		.map(({ slug, title, content, type }) => {
			return {
				slug,
				title: replace_text_with_marker(title, match),
				content: get_matches(content, match),
				type
			};
		});
}

function replace_text_with_marker(text: string, match: string) {
	const regex = new RegExp(match, "gi");
	return text.replaceAll(
		regex,
		(match) => `<span class='mark'>${match}</span>`
	);
}

function get_matches(text: string, search_term: string, limit = 1) {
	const regex = new RegExp(search_term, "gi");
	const indexes = [];
	let matches = 0;
	let match;

	while ((match = regex.exec(text)) !== null && matches < limit) {
		indexes.push(match.index);
		matches++;
	}

	return indexes.map((index) => {
		const start = index - 20;
		const end = index + 80;
		const excerpt = text.substring(start, end).trim();
		return `...${replace_text_with_marker(excerpt, search_term)}...`;
	});
}

import { json } from '@sveltejs/kit'
import matter from 'gray-matter'

export const prerender = true

const patterns: Record<string, RegExp> = {
	frontmatter: /---.*?---/gs,
	code: /```.*?\n|```/gs,
	inline: /`([^`]*)`/g,
	heading: /^#{1,6}\s.*$/gm,
	link: /\[([^\]]+)\]\(([^)]+)\)/g,
	image: /\!\[.*?\]\(.*?\)/g,
	blockquote: /> /gm,
	bold: /\*\*/g,
	italic: /\b_([^_]+)_(?!\w)/g,
	special: /{%.*?%}/g,
	tags: /[<>]/g,
}

const htmlEntities: Record<string, string> = {
	'<': '&lt;',
	'>': '&gt;',
}

function stripMarkdown(markdown: string) {
	for (const pattern in patterns) {
		switch (pattern) {
			case 'inline':
				markdown = markdown.replace(patterns[pattern], '$1')
				break
			case 'tags':
				markdown = markdown.replace(
					patterns[pattern],
					(match) => htmlEntities[match]
				)
				break
			case 'link':
				markdown = markdown.replace(patterns[pattern], '$2')
				break
			case 'italic':
				markdown = markdown.replace(patterns[pattern], '$1')
				break
			default:
				markdown = markdown.replace(patterns[pattern], '')
		}
	}

	return markdown
}

// @ts-ignore
export async function GET() {
	const doc_paths = import.meta.glob("/src/lib/templates*/gradio/**/*.svx");
	const doc_pages = await Promise.all(Object.entries(doc_paths)
		.map(async ([path, content]) => {
            content = await content();
            content = content.default.render().html;
			// const frontmatter = matter(content);
            // console.log("frontmatter", frontmatter);
            // console.log({
			// 	title: content.split("<h1>")[1] ? content.split("<h1>")[1].split("</h1>")[0] : null,
			// 	slug: path,
			// 	content: stripMarkdown(content),
			// })

			return  {
				title: content.split("<h1>")[1] ? content.split("<h1>")[1].split("</h1>")[0] : null,
				slug: path,
				content: stripMarkdown(content),
			}
		}))
    console.log(doc_pages);

	return json(doc_pages)
}
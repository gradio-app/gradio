import { json } from '@sveltejs/kit'

export const prerender = true

function removeMarkdown(markdown) {
	return markdown
	  // Remove headers
	  .replace(/^#{1,6}\s+/gm, '')
	  // Remove bold and italic emphasis
	  .replace(/(\*\*|__)(.*?)\1/g, '$2')
	  .replace(/(\*|_)(.*?)\1/g, '$2')
	  // Remove strikethrough
	  .replace(/~~(.*?)~~/g, '$1')
	  // Remove inline code
	  .replace(/`([^`]+)`/g, '$1')
	  // Remove code blocks
	  .replace(/```[\s\S]*?```/g, '')
	  // Remove images
	  .replace(/!\[.*?\]\(.*?\)/g, '')
	  // Remove links but keep text
	  .replace(/\[(.*?)\]\(.*?\)/g, '$1')
	  // Remove blockquotes
	  .replace(/^>\s+/gm, '')
	  // Remove horizontal rules
	  .replace(/^---$/gm, '')
	  // Remove unordered lists
	  .replace(/^\s*[-+*]\s+/gm, '')
	  // Remove ordered lists
	  .replace(/^\s*\d+\.\s+/gm, '')
	  // Remove extra newlines
	  .replace(/\n{2,}/g, '\n')
	  // Trim leading/trailing whitespace
	  .trim();
  }

export async function GET() {
	const doc_paths = import.meta.glob("/src/lib/templates/gradio/**/*.svx");
	const doc_pages = await Promise.all(Object.entries(doc_paths)
		.map(async ([path, content]) => {
            content = await content();
            content = content.default.render().html;
			let match = content.match(/<h1[^>]*>(.*?)<\/h1>/i)
			let title = ""
			if (match && match[1]) {
				title = match[1]
			}
			path = path.split("/").slice(-1)[0]
			path = path.match(/(?:\d{2}_)?(.+)/i)[1]
			path = "/docs/gradio/" + path.split(".svx")[0]

			return  {
				title: title,
				slug: path,
				content: content.replaceAll(/<[^>]*>?/gm, ''),
				type: "DOCS"
			}
		}))
	const guide_paths = import.meta.glob("/src/lib/json/guides/*.json");
	delete guide_paths["/src/lib/json/guides/guides_by_category.json"]
	delete guide_paths["/src/lib/json/guides/guide_names.json"]
	const guide_pages = await Promise.all(Object.entries(guide_paths)
			.map(async ([path, content]) => {
			content = await content();
			content = content.default.guide;
			return  {
				title: content.pretty_name,
				slug: content.url,
				content: removeMarkdown(content.content.replaceAll(/<[^>]*>?/gm, '')),
				type: "GUIDE"
		}
	}))
	let all_pages = doc_pages.concat(guide_pages)
	return json(all_pages)
}
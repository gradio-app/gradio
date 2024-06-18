import { json } from '@sveltejs/kit'

export const prerender = true

export async function GET() {
	const doc_paths = import.meta.glob("/src/lib/templates*/gradio/**/*.svx");
	const doc_pages = await Promise.all(Object.entries(doc_paths)
		.map(async ([path, content]) => {
            content = await content();
            content = content.default.render().html;

			return  {
				title: content.split("<h1>")[1] ? content.split("<h1>")[1].split("</h1>")[0] : "",
				slug: path,
				content: content.replaceAll(/<[^>]*>?/gm, ''),
			}
		}))
	return json(doc_pages)
}
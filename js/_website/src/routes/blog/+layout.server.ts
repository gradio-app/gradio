export const prerender = true;

let cache = new Map();

async function load_main_blog_names() {
	if (cache.has(`main_blog_names`)) {
		return cache.get(`main_blog_names`);
	}
	let blog_names_json = await import(`../../lib/json/blogs/blog_names.json`);
	cache.set(`main_blog_names`, blog_names_json);
	return blog_names_json;
}

async function load_main_blogs(blog_urls: string[]) {
	if (cache.has(`main_blogs`)) {
		return cache.get(`main_blogs`);
	}
	let blogs: { [key: string]: any } = {};
	for (const blog_url of blog_urls) {
		let blog_json = await import(`../../lib/json/blogs/${blog_url}.json`);
		blogs[blog_url] = blog_json;
	}
	cache.set(`main_blogs`, blogs);
	return blogs;
}

export async function load({ params, url }) {
	let blog_names_json = await load_main_blog_names();
	let blogs = await load_main_blogs(blog_names_json.blog_urls);

	return {
		blog_names_json,
		blogs
	};
}

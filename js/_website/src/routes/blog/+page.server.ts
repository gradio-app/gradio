async function load_main_blog_categories() {
	return await import(`../../lib/json/blogs/blogs_by_category.json`);
}

export async function load({ params, parent }) {
	let blogs_by_category_json = await load_main_blog_categories();

	return {
		blogs_by_category: blogs_by_category_json.blogs_by_category
	};
}

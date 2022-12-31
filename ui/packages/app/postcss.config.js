module.exports = {
	extract: "themes.css",
	plugins: [
		custom_media,
		require("tailwindcss/nesting"),
		require("tailwindcss")
	]
};

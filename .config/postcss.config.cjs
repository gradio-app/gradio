const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const nested = require("tailwindcss/nesting");
const tw_config = require("./tailwind.config.cjs");

module.exports = {
	plugins: [nested, tailwindcss(tw_config), autoprefixer]
};

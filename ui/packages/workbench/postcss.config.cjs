const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const nested = require("tailwindcss/nesting");

module.exports = {
	plugins: [nested, tailwindcss(), autoprefixer]
};

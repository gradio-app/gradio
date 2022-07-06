const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')
const postcss_hash = require('postcss-hash')

module.exports = {
    plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        cssnano({
            preset: 'default'
        }),
        purgecss({
            content: ['./src/**/*.html'],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
        }),
        postcss_hash({
            algorithm: 'sha256',
            trim: 20,
            manifest: './build/manifest.json'
        }),
    ],
}
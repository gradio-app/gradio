# Building Gradio Website

Run the following commands in order:
- `pip install -r requirements.txt`
- `npm install`
- `npm run build`

The website will be built in the dist/ folder as a static website. To launch, run: `cd dist && python3 -m http.server`

## Build explained

`npm run build` runs the following series of commands
- `mkdir -p dist generated` -> creates the intermediate folder 'generated', where HTML files are generated and stored pre-minification, and final output folder 'dist' 
- `python3 render_guides.py` -> generates the guides as HTML pages in the 'generated' folder, using the readme_template.md in the top level gradio folder as the source
- `python3 render_docs.py` -> generates the docs as HTML pages in the 'generated' folder, using the readme_template.md in the top level gradio folder as the source
- `cp src/index.html generated/index.html` -> moves the homepage to the generated folder as well
- `html-minifier --input-dir generated --output-dir dist --file-ext html --remove-comments --collapse-whitespace --minify-js true` -> minifies all HTML files and stores them in dist/
- `postcss src/style.css -o dist/style.css && cp -R src/static/. dist/static/` -> minifies and tree-shakes the tailwind CSS files and stores the output in dist/

# Modifying the Website

The HTML and CSS template of the website should be modified in the src/ directory. To build changes, run `npm run build`. To automatically rebuild when you change a file in src/, run `npm run watch`.
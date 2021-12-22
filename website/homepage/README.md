# Building Gradio Website

Run the following commands in order:
- `pip install -r requirements.txt`
- `npm install`
- `npm run build`

The website will be built in the dist/ folder as a static website. To launch, run: `cd dist && python3 -m http.server`

# Modifying the Website

The HTML and CSS template of the website should be modified in the src/ directory. To build changes, run `npm run build`. To automatically rebuild when you change a file in src/, run `npm run watch`.
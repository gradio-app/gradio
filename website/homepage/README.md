# Building Gradio Website

Run the following commands in order:
- `pip install -r requirements.txt`
- `npm install`
- `npm run build` (or `npm run build-mac` on Mac OSX)

The website will be built in the build/ folder as a static website. To launch, run: `cd build && python3 -m http.server`

# Running Gradio Offline

Gradio is designed to work without an internet connection when you run apps locally with `launch()`. The UI, API, file uploads, and most components load assets from the Python server bundled with the package — not from external CDNs.

## What works offline

| Feature | Offline support |
| --- | --- |
| Local launch (`demo.launch()`) | Yes — JS/CSS served from `/assets/` |
| Default and built-in themes | Yes — fonts bundled under `/static/fonts/` |
| Plotly, Matplotlib, Altair plots | Yes — bundled in the frontend |
| KaTeX / LaTeX in Markdown & Chatbot | Yes — bundled |
| Model3D (Babylon.js) | Yes — bundled |
| Bokeh plots | Yes — JS bundled under `/static/bokeh/{version}/` |
| Video playback | Yes |
| Video trim / edit | Yes — FFmpeg WASM bundled under `/static/ffmpeg/` |
| Iframe embeds | Yes — iframe-resizer bundled under `/static/js/` |
| MCP landing page | Yes — uses bundled fonts |
| Queue, auth, file I/O | Yes — local server only |

## What requires internet

| Feature | Why |
| --- | --- |
| `share=True` | Downloads FRP tunnel binary and connects to `gradio.live` |
| CDN embed (`share.html`) | Loads `gradio.js` from the Gradio S3 CDN |
| Hugging Face OAuth / login | External auth provider |
| Downloading themes from the Hub | Hugging Face Hub |
| `GoogleFont` for fonts not bundled locally | Falls back to `fonts.googleapis.com` |
| Custom `head=` CDN scripts | User-provided external URLs |
| Plotly map plots | Map tile servers (OpenStreetMap, etc.) |
| Vibe editor deploy | Creates Spaces on huggingface.co |
| Default component example URLs | GitHub raw links (docs only) |

## Using custom themes offline

Built-in themes use `gr.themes.LocalFont`, which serves `.woff2` files from `/static/fonts/`.

If you use `gr.themes.GoogleFont("My Font")`, Gradio checks whether that font is bundled locally. When it is, the local copy is used automatically. When it is not, the Google Fonts CDN is used (requires internet).

To stay offline with a custom font, either:

1. Use a system font string: `font="Arial, sans-serif"`
2. Use `LocalFont` and add `.woff2` files under `gradio/templates/frontend/static/fonts/{FontName}/` (see existing fonts for naming), or
3. Rely on `GoogleFont` — it will use the CDN if no local bundle exists

## Building from source

When building the frontend from source, offline assets (fonts, Bokeh, FFmpeg, iframe-resizer) are downloaded by:

```bash
python scripts/download_offline_assets.py
```

This runs automatically as part of `scripts/build_frontend.sh`. The downloaded files are committed to the repository so end users who `pip install gradio` get them without running the script.

## Verifying offline operation

1. Start a simple app: `python -c "import gradio as gr; gr.Interface(lambda x: x, 'text', 'text').launch()"`
2. Disconnect from the network (or block external requests in browser devtools)
3. Reload the page — the UI should render with correct styling

Console errors for blocked Google Fonts or CDN requests indicate a component still loading external resources. File an issue if you see this with the default theme and no custom `head`/`css`.

## Related

- [Issue #1450](https://github.com/gradio-app/gradio/issues/1450) — original offline support request
- [Theming guide](/guides/theming-guide) — fonts and themes

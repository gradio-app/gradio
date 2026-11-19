# `gradio_components`: the UI components of Gradio

Starting with Gradio 7, `pip install gradio` installs only the lightweight core:
the server, the queue, the API engine and `gr.Server`. Everything that builds a
user interface (`gr.Blocks`, `gr.Interface`, `gr.ChatInterface` and every built-in
component such as `gr.Textbox` or `gr.Image`) lives in this package, together with
the heavier dependencies those components need.

You do not normally install this package by name. Install it through the extra, which
pins the version that matches your version of Gradio:

```bash
pip install "gradio[components]"
```

Your code does not change: keep writing `import gradio as gr` and `gr.Textbox(...)`.

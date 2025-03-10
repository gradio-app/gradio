# Understanding Share Links and Share Servers

You probably know that you can share any Gradio app that you build by setting `share=True` in the `.launch()` method. In other words, if you do:

```py
import gradio as gr

with gr.Blocks() as demo:
    ...

demo.launch(share=True)
```

This creates a publicly accessible **share link** (which looks like: `https://xxxxx.gradio.live`) to your Gradio application immediately, letting you share your app with anyone (while keeping the code and model running in your local environment). The link is created on Gradio's **share server**, which does not host your Gradio app, but instead creates a _tunnel_ to your locally-running Gradio app.

This is particlarly useful when you are prototyping and want to get immediate feedback on your machine learning app, without having to deal with the hassle of hosting or deploying your application.

But how is this link created, and how can you create your own share server? Read on!


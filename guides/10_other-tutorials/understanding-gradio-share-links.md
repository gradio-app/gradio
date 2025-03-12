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

<video controls>
  <source src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/share-links.mov" type="video/mp4">
</video>

At any given time, more than 8,000 Gradio apps are being shared through share links. But how is this link created, and how can you create your own share server? Read on!

### Fast Reverse Proxy

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/frp-gradio-diagram.svg)

Gradio share links are powered by Fast Reverse Proxy (FRP), an open-source tunneling solution. Here's how it works:

When you create a Gradio app with `share=True`, the FRP Client is automatically downloaded to your local machine (if not already installed). This client establishes a secure TLS tunnel to Gradio's Share Server, which hosts the FRP Server component capable of handling thousands of simultaneous connections.

Once the tunnel is established, Gradio's Share Server exposes your locally-running application to the internet under a unique domain in the format `xxxxx.gradio.live`. This entire process happens in the background, when you launch a Gradio app with `share=True`.

Next, we'll dive deeper into both the FRP Client and FRP Server, as it relates to Gradio share links



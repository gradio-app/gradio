# Share Links and Share Servers

You may already know that you can share any Gradio app that you build by setting `share=True` in the `.launch()` method. In other words, if you do:

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

At any given time, more than 5,000 Gradio apps are being shared through share links. But how is this link created, and how can you create your own share server? Read on!

### Fast Reverse Proxy (FRP)

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/frp-gradio-diagram.svg)

Gradio share links are powered by Fast Reverse Proxy (FRP), an [open-source tunneling solution](https://github.com/huggingface/frp). Here's how it works:

When you create a Gradio app with `share=True`, the FRP Client is automatically downloaded to your local machine (if not already installed). This client establishes a secure TLS tunnel to Gradio's Share Server, which hosts the FRP Server component capable of handling thousands of simultaneous connections.

Once the tunnel is established, Gradio's Share Server exposes your locally-running application to the internet under a unique domain in the format `xxxxx.gradio.live`. This entire process happens in the background, when you launch a Gradio app with `share=True`.

Next, we'll dive deeper into both the FRP Client and FRP Server, as they are used in Gradio.

### FRP Client

We use a [modified version of the FRP Client](https://github.com/huggingface/frp/tree/tls/client), which runs on your machine. We package binaries for the most common operating systems, and the FRP Client for your system is downloaded the first time you create a share link on your machine.

**Code**:
* The complete Go code for the client can be found [in this directory](https://github.com/huggingface/frp/tree/tls/client).
* We use this [Make script](https://github.com/huggingface/frp/blob/tls/Makefile) to package the Go code into binaries for each operating system.

**Trouble Shooting**: Some antivirus programs (notably Windows Defender) block the download of the FRP Client. In this case, you'll see a message with details on how to install the file manually, something like:

```
Could not create share link. Missing file: /Users/.../frpc_darwin_arm64_v0.3. 

Please check your internet connection. This can happen if your antivirus software blocks the download of this file. You can install manually by following these steps: 

1. Download this file: https://cdn-media.huggingface.co/frpc-gradio-0.3/frpc_darwin_arm64
2. Rename the downloaded file to: frpc_darwin_arm64_v0.3
3. Move the file to this location: /Users/...
```

If this does not work, you may need to [whitelist this file with your antivirus](https://www.makeuseof.com/how-to-whitelist-files-windows-defender/) in order to use the share links.

### FRP Server

Gradio runs a share server, which is a modified version of the FRP server. This server handles the public-facing side of the tunnel, receiving incoming connections from the internet and routing them to the appropriate FRP client running on your local machine.

The official Gradio share server is hosted at `gradio.live`, and we make our best effort to keep it running reliably at all times. This is the server that's used by default when you set `share=True` in your Gradio applications. You can check the current operational status of the official Gradio share server at [https://status.gradio.app/](https://status.gradio.app/). 

If you prefer, you can also host your own FRP server. This gives you complete control over the tunneling infrastructure and can be useful for enterprise deployments or situations where you need custom domains or additional security measures, or if you want to avoid the 72 hour timeout that is in place for links created through Gradio's official share server. Here are the instructions for running your own [Gradio Share Server](https://github.com/huggingface/frp?tab=readme-ov-file#why-run-your-own-share-server).


**Code**:
* The complete Go code for the client can be found [in this directory](https://github.com/huggingface/frp/tree/dev/server).
* The Dockerfile to launch [the FRP Server](https://github.com/huggingface/frp/blob/dev/dockerfiles/Dockerfile-for-frps) can be found here.

**Trouble Shooting**: Gradio's Share Server may occasionally go down, despite our best effort to keep it running. If the [status page](https://status.gradio.app/) shows that the Gradio server is down, we'll work on fixing it, no need to create an issue!






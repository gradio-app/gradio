# Configuring a Gradio Queue for Maximum Performance

Once in a while, a Gradio demo goes *viral* on social media -- you have lots of users trying it out simultaneously, and you want to provide your users with the best possible experience:minimize the amount of time that each user has to wait in the queue to see their prediction.

How can you configure your Gradio demo to handle the most traffic? In this Guide, we dive into some of the parameters of Gradio's `.queue()` method as well as some other related configuations, and how to set these parametesr in a way that allows you to serve lots of users simultaneously with
minimal latency.

This is an advanced guide, so make sure you know the basics of Gradio already, such as [how to create and launch a Gradio demo](https://gradio.app/quickstart/). Most of the information in this Guide is relevant whether you are hosting your demo on [Hugging Face Spaces](https://hf.space) or on your own server.

## Gradio's Queueing System

By default, a Gradio demo sends prediction requests via a POST request to the server where your Gradio server and Python code are running. However, regular POST requests have a TWO big of limitations:

(1) They time out after a short period of time -- most browsers raise a timeout error
if they do not get a response to a POST request after a short period of time (e.g. 1 min).
This can be a problem if your inference function takes longer than 1 minute to run or
if many people are trying out your demo at the same time, resulting in increased latency.

(2) They do not allow bi-directional communication between the Gradio demo and the Gradio server. This means, for example, that you cannot get a real-time ETA of how long your predictionwill take to complete.

To address these limitations, any Gradio app can be converted to use **websockets** instead, simply by adding `.queue()` before launching an Interface or a Blocks. Here's an example:

```py
identity_demo = gr.Interface(lambda x:x, "image", "image")
identity_demo.queue()  # <-- Sets up a queue with default parameters
identity_demo.launch()
```

In the demo `identity_demo` above, predictions will now be sent over a websocket instead.
Unlike POST requests, websockets do not timeout and they allow bidirectional traffic. On the Gradio server, a **queue** is set up, which adds each request that comes to a list. When a worker is free, the first available request is passed into the worker for inference. When the inference is complete, the queue sends the prediction back through the websocket tothe particular Gradio user who called that prediction. 

There are several parameters that can be used to configure the queue and help reduce latency. Let's go through them one-by-one.

Note: If you host your Gradio app on [Hugging Face Spaces](https://hf.space), the queue is **enabled by default**. You can still call the `.queue()` method manually in order to
configure the queue as described below.

### The `concurrency_count` parameter

The first parameter we will explore is the `concurrency_count` parameter. This parameter is used to set the number of worker threads in the Gradio server that will be processing your requests in parallel. By default, this parameter is set to `1` but increasing this can linearly multiply the capacity of your server to handle requests.

So why not set this parameter infinitely high? 

### The `max_size` parameter

### The `batch_size` parameter

### Upgrading your Hardware (GPUs, TPUs, etc.)




## Example: Deploying Stable Diffusion with Gradio with a GPU





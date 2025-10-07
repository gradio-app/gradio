# Deploying a Gradio app with Modal

Tags: DEPLOYMENT, MODAL


### Introduction

Gradio is a great way to test and demo your machine learning apps using a simple and intuitive Python API. When combined with Modal's developer-first cloud infrastructure, you can leverage powerful GPUs to run larger models faster. And you don't need an account with a cloud provider or any config files.

In this tutorial, we will walk you through setting up a Modal account, deploying a simple Gradio app on Modal, and discuss some of the nuance around Gradio's sticky session requirement and handling concurrency.

## Deploying a simple Gradio app on Modal
Let's deploy a Gradio-style "Hello, world" app that lets a user input their name and then responds with a short greeting. We're not going to use this code as-is in our app, but it's useful to see what the initial Gradio version looks like.

```python
import gradio as gr

# A simple Gradio interface for a greeting function
def greet(name):
    return f"Hello {name}!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")
demo.launch()
```

To deploy this app on Modal you'll need to
- define your container image,
- wrap the Gradio app in a Modal Function,
- and deploy it using Modal's CLI!

### Prerequisite: Install and set up Modal

Before you get started, you'll need to create a Modal account if you don't already have one. Then you can set up your environment by authenticating with those account credentials.

- Sign up at [modal.com](https://www.modal.com?utm_source=partner&utm_medium=github&utm_campaign=livekit). 
- Install the Modal client in your local development environment.
```bash
pip install modal
```
- Authenticate your account.
```
modal setup
```

Great, now we can start building our app!

### Step 1: Define our  `modal.Image`
To start, let's make a new file named `gradio_app.py`, import `modal`, and define our image. Modal `Images` are defined by sequentially calling methods on our `Image` instance. 

For this simple app, we'll 
- start with the `debian_slim` image,
- choose a Python version (3.12),
- and install the dependencies - only `fastapi` and `gradio`.

```python
import modal

app = modal.App("gradio-app")
web_image = modal.Image.debian_slim(python_version="3.12").uv_pip_install(
    "fastapi[standard]",
    "gradio",
)
```

Note, that you don't need to install `gradio` or `fastapi` in your local environement - only `modal` is required locally.

### Step 2: Wrap the Gradio app in a Modal-deployed FastAPI app
Like many Gradio apps, the example above is run by calling `launch()` on our demo at the end of the script. However, Modal doesn't run scripts, it runs functions - serverless functions to be exact.

To get Modal to serve our `demo`, we can leverage Gradio and Modal's support for `fastapi` apps. We do this with the `@modal.asgi_app()` function decorator which deploys the web app returned by the function. And we use the `mount_gradio_app` function to add our Gradio `demo` as a route in the web app.

```python
with web_image.imports():
	import gradio as gr
    from gradio.routes import mount_gradio_app
    from fastapi import FastAPI
     
@app.function(
    image=web_image,
    max_containers = 1, # we'll come to this later 
)
@modal.concurrent(max_inputs=100) # allow multiple users at one time
@modal.asgi_app()
def ui():
    """A simple Gradio interface for a greeting function."""
    def greet(name):
	    return f"Hello {name}!"
	
	demo = gr.Interface(fn=greet, inputs="text", outputs="text")

    return mount_gradio_app(app=FastAPI(), blocks=demo, path="/")
```

Let's quickly review what's going on here:
- We use the `Image.imports` context manager to define our imports. These will be available when your function runs in the cloud.
- We move our code inside a function, `ui`, and decorate it with `@app.function` which wraps it as a Modal serverless function. We provide the image and other parameters (we'll cover this later) as inputs to the decorator.
- We add the `@modal.concurrent` decorator which allows multiple requests per container to be processed at the same time.
- We add the `@modal.asgi_app` decorator which tells Modal that this particular function is serving an ASGI app (here a `fastapi` app). To use this decorator, your ASGI app needs to be the return value from the function.

### Step 3: Deploying on Modal
To deploy the app, just run the following command:
```bash
modal deploy <path-to-file>
```

The first time you run your app, Modal will build and cache the image which, takes about 30 seconds. As long as you don't change the image, subsequent deployments will only take a few seconds.

After the image builds Modal will print the URL to your webapp and to your Modal dashboard. The webapp URL should look something like `https://{workspace}-{environment}--gradio-app-ui.modal.run`. Paste it into your web browser a try out your app!

## Important Considerations

### Sticky Sessions
Modal Functions are serverless which means that each client request is considered independent. While this facilitates autoscaling, it can also mean that extra care should be taken if your application requires any sort of server-side statefulness.

Gradio relies on a REST API, which is itself stateless. But it does require sticky sessions, meaning that every request from a particular client must be routed to the same container. However, Modal does not make any guarantees in this regard.

A simple way to satisfy this constraint is to set `max_containers = 1` in the `@app.function` decorator and setting the `max_inputs` argument of `@modal.concurrent` to a fairly large number - as we did above. This means that Modal won't spin up more than one container to serve requests to your app which effectively satisfies the sticky session requirement.

### Concurrency and Queues

Both Gradio and Modal have concepts of concurrency and queues, and getting the most of out of your compute resources requires understanding how these interact.

Modal queues client requests to functions and simultaneously executes requests up to its concurrency limit per container. If requests come in and the concurrency limit is already satisfied, Modal will spin up a new container up to the maximum set for the function. In our case, our Gradio app is represented by one Modal Function, so all requests share one queue and concurrency limit. Therefore Modal constrains the _total_ number of requests running at one time, regardless of what they are doing.

Gradio on the other hand, allows developers to assign one or more event listeners to a any number of queues, each with its own concurrency limit. This can be useful to manage GPU resources for computationally expensive requests.

Thinking carefully about how these queues and limits interact can help you optimize your app's performance and resource optimization while avoiding unwanted results like shared or lost state.

### Creating a GPU Function

Another option to manage GPU utilization is to deploy your GPU computations in their own Modal Function and calling this remote function from inside your Gradio app. This allows you to take full advantage of Modal's serverless autoscaling while routing all of the client HTTP requests to a single Gradio CPU container.
# `gradio_client`: Use any Gradio app as an API -- in 3 lines of Python

This directory contains the source code for `gradio_client`, a lightweight Python library that makes it very easy to use any Gradio app as an API. This library is 

As an example, consider the Stable Diffusion Gradio app, which is hosted on Hugging Face Spaces, and which generates images given a text prompt. Using the `gradio_client` library, we can easily use the Gradio as an API to generates images programmatically.

Here's the entire code to do it:

```python
import gradio_client as grc

client = grc.Client(space="stability-ai/stable-diffusion")
job = client.predict("a hyperrealistic portrait of a cat wearing cyberpunk armor")
job.result()

>> URL

```

## Installation

If you already have a recent version of `gradio`, then the `gradio_client` is included as a dependency. Otherwise, the lightweight `gradio_client` package can be installed from pip (or pip3) and works with Python versions 3.7 or higher:

```bash
$ pip install gradio_client
```

## Usage

### Connecting to a Space or a Gradio app

1. Connecting to a Space
2. Connecting a general Gradio app

### Inspecting the API

1. Listing all of the available APIs
2. Getting more info about the parameters for a speciic API

### Making a prediction

1. client.run

### Submitting a job (for asynchronous worklows)

1. job = client.submit
2. job.status
3. callbacks



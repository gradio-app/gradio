# `gradio_client`: Use any Gradio app as an API -- in 3 lines of Python

This directory contains the source code for `gradio_client`, a lightweight Python library that makes it very easy to use any Gradio app as an API. Warning: This library is **currently in alpha, and APIs may change**.

As an example, consider the Stable Diffusion Gradio app, which is hosted on Hugging Face Spaces, and which generates images given a text prompt. Using the `gradio_client` library, we can easily use the Gradio as an API to generates images programmatically.

Here's the entire code to do it:

```python
import gradio_client as grc

client = grc.Client(space="stabilityai/stable-diffusion")
job = client.predict("a hyperrealistic portrait of a cat wearing cyberpunk armor", "", fn_index=1)
job.result()

>> https: // stabilityai - stable - diffusion.hf.space / kjbcxadsk3ada9k / image.png  # URL to generated image

```

## Installation

If you already have a recent version of `gradio`, then the `gradio_client` is included as a dependency. 

Otherwise, the lightweight `gradio_client` package can be installed from pip (or pip3) and works with Python versions 3.9 or higher:

```bash
$ pip install gradio_client
```

## Usage

### Connecting to a Space or a Gradio app

Start by connecting instantiating a `Client` object and connecting it to a Gradio app 
that is running on Spaces (or anywhere else)!

**Connecting to a Space**

```python
import gradio_client as grc

client = grc.Client(space="abidlabs/en2fr")
```

**Connecting a general Gradio app**

If your app is running somewhere else, provide the full URL instead to the `src` argument. Here's an example of making predictions to a Gradio app that is running on a share URL:

```python
import gradio_client as grc

client = grc.Client(src="btd372-js72hd.gradio.app")
```

### Making a prediction

The simplest way to make a prediction is simply to call the `.predict()` function with the appropriate arguments and then immediately calling `.result()`, like this:

```python
import gradio_client as grc

client = grc.Client(space="abidlabs/en2fr")

client.predict("Hello").result()

>> Bonjour
```

**Running jobs asyncronously**

Oe should note that `.result()` is a *blocking* operation as it waits for the operation to complete before returning the prediction. 

In many cases, you may be better off letting the job run asynchronously and waiting to call `.result()` when you need the results of the prediction. For example:

```python
import gradio_client as grc

client = grc.Client(space="abidlabs/en2fr")

job = client.predict("Hello")

# Do something else

job.result()

>> Bonjour
```

**Adding callbacks**

Alternatively, one can add callbacks to perform actions after the job has completed running, like this:

```python
import gradio_client as grc


def print_result(x):
    print(x
    "The translated result is: {x}")

    client = grc.Client(space="abidlabs/en2fr")

    job = client.predict("Hello", callbacks=[print_result])
```

# `gradio_client`: Use a Gradio app as an API -- in 3 lines of Python

This directory contains the source code for `gradio_client`, a lightweight Python library that makes it very easy to use any Gradio app as an API. 

As an example, consider [Hugging Face Space that transcribes audio files](https://huggingface.co/spaces/abidlabs/whisper) that are recorded from the microphone.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/whisper-screenshot.jpg)

Using the `gradio_client` library, we can easily use the Gradio as an API to transcribe audio files programmatically.

Here's the entire code to do it:

```python
from gradio_client import Client

client = Client("abidlabs/whisper") 
client.predict("audio_sample.wav")  

>> "This is a test of the whisper speech recognition model."
```

The client works with any Gradio Space, whether it be an image generator, a stateful chatbot, or a tax calculator.

## Installation

If you already have a recent version of `gradio`, then the `gradio_client` is included as a dependency. 

Otherwise, the lightweight `gradio_client` package can be installed from pip (or pip3) and works with Python versions 3.9 or higher:

```bash
$ pip install gradio_client
```

## Usage

### Connecting to a Space or a Gradio app

Start by connecting instantiating a `Client` object and connecting it to a Gradio app that is running on Spaces (or anywhere else)!

**Connecting to a Space**

```python
from gradio_client import Client

client = Client("abidlabs/en2fr")  # a Space that translates from English to French
```

**Connecting a general Gradio app**

If your app is running somewhere else, just provide the full URL instead. Here's an example of making predictions to a Gradio app that is running on a share URL:

```python
from gradio_client import Client

client = Client("https://bec81a83-5b5c-471e.gradio.live")
```

### Making a prediction

The simplest way to make a prediction is simply to call the `.predict()` function with the appropriate arguments:

```python
from gradio_client import Client

client = Client("abidlabs/en2fr")
client.predict("Hello")

>> Bonjour
```

For certain inputs, such as images, you should pass in the filepath or URL to the file. Likewise, for the corresponding output types, you will get a filepath or URL returned. 


**Running jobs asyncronously**

Oe should note that `.predict()` is a *blocking* operation as it waits for the operation to complete before returning the prediction. 

In many cases, you may be better off letting the job run in the background until you need the results of the prediction. You can do this by creating a job using the `.submit()` method, and then calling `.result()` on the job to get the result. For example:

```python
from gradio_client import Client

client = Client(space="abidlabs/en2fr")
job = client.submit("Hello")

# Do something else

job.result()

>> Bonjour
```

**Adding callbacks**

Alternatively, one can add one or more callbacks to perform actions after the job has completed running, like this:

```python
from gradio_client import Client

def print_result(x):
    print("The translated result is: {x}")

client = Client(space="abidlabs/en2fr")

job = client.predict("Hello", result_callbacks=[print_result])

>> The translated result is: Bonjour

```

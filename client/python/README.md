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

You can also connect to private Spaces by passing in your HF token with the `hf_token` parameter.

**Connecting a general Gradio app**

If your app is running somewhere else, just provide the full URL instead. Here's an example of making predictions to a Gradio app that is running on a share URL:

```python
from gradio_client import Client

client = Client("https://bec81a83-5b5c-471e.gradio.live")
```

### Inspecting the API endpoints

Once you have connected to a Gradio app, you can view the APIs that are available to you by calling the `Client.view_api()` method. For the Whisper Space, we see the following:

```
Client.predict() Usage Info
---------------------------
Named API endpoints: 1

 - predict(input_audio, api_name="/predict") -> value_0
    Parameters:
     - [Audio] input_audio: str (filepath or URL)
    Returns:
     - [Textbox] value_0: str (value)
```

This shows us how to use the API endpoint: we should call the `.predict()` method, providing a parameter `input_audio` of type `str`, which is a `filepath or URL`. 

We should also provide the `api_name='/predict'` argument. Although this isn't necessary if a Gradio app has a single named endpoint, it does allow us to call different endpoints in a single app if they are available. If an app has unnamed API endpoints, these can also be displayed by running `.view_api(all_endpoints=True)`.


### Making a prediction

The simplest way to make a prediction is simply to call the `.predict()` function with the appropriate arguments:

```python
from gradio_client import Client

client = Client("abidlabs/en2fr")
client.predict("Hello")

>> Bonjour
```

If there are multiple parameters, then you should pass them as separate arguments to `.predict()`, like this:


```python
from gradio_client import Client

client = Client("gradio/calculator")
client.predict(4, "add", 5)

>> 9.0
```

For certain inputs, such as images, you should pass in the filepath or URL to the file. Likewise, for the corresponding output types, you will get a filepath or URL returned. 

```python
from gradio_client import Client

client = Client("abidlabs/whisper")
client.predict("https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3")

>> "My thought I have nobody by a beauty and will as you poured. Mr. Rochester is serve in that so don't find simpus, and devoted abode, to at might in a r—"
```


**Running jobs asyncronously**

Oe should note that `.predict()` is a *blocking* operation as it waits for the operation to complete before returning the prediction. 

In many cases, you may be better off letting the job run in the background until you need the results of the prediction. You can do this by creating a `Job` instance using the `.submit()` method, and then calling `.result()` on the job to get the result. For example:

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

**Status**

The `Job` object also allows you to get the status of the running job by calling the `.status()` method. This returns a `StatusUpdate` object with attributes such as `code` and `eta`. 

```py
from gradio_client import Client

client = Client(src="gradio/calculator")
job = client.submit(5, "add", 4, api_name="/predict")
job.status()

>> <Status.STARTING: 'STARTING'>
```

The `Job` object also has a `done()` instance method which returns a boolean indicating whether the job has completed.

### Generator Endpoints

Some Gradio API endpoints do not return a single value, rather they return a series of values. You can get the series of values that have been returned at any time from such a generator endpoint by running `job.outputs()`:

```py
from gradio_client import Client

client = Client(src="gradio/count_generator")
job = client.submit(3, api_name="/count")
while not job.done():
    time.sleep(0.1)
job.outputs()

>> ['0', '1', '2']
```

Note that running `job.result()` on a generator endpoint only gives you the *first* value returned by the endpoint. 
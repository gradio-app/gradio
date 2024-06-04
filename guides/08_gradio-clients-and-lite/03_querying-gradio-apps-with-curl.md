# Querying Gradio Apps with Curl

Tags: CURL, API, SPACES

It is possible to use any Gradio app as an API using cURL, the command-line tool that is pre-installed on many operating systems. This is particularly useful if you are trying to query a Gradio app from an environment other than Python or Javascript (since specialized Gradio clients exist for both [Python](guides/getting-started-with-the-python-client) and [Javascript](guides/getting-started-with-the-js-client)).

As an example, consider this Hugging Face Space that translates text from English to French: https://abidlabs-en2fr.hf.space/.

Using `curl`, we can translate text programmatically.

Here's the entire code to do it:

```bash
$ curl -X POST https://abidlabs-en2fr.hf.space/call/predict -H "Content-Type: application/json" -d '{
  "data": ["Hello, my friend."] 
}'

> {"event_id": $EVENT_ID}   
```

```bash
$ curl -N https://abidlabs-en2fr.hf.space/call/predict/$EVENT_ID

> event: complete
> data: ["Bonjour, mon ami."]
```

Note: making a prediction and getting a result requires two `curl` calls. The first call returns and prints to the console the `EVENT_ID`, which is used in the second call to fetch the results. We'll cover these two steps in more detail in the Guide below.


**Prerequisites**: For this Guide, you do _not_ need to know the `gradio` library in great detail. However, it is helpful to have general familiarity with Gradio's concepts of input and output components.

## Installation

Generally speaking, you don't need to install cURL, as it comes pre-installed on many operating systems. Run 

```bash
curl --version
```

to confirm that `curl` is installed. If it is not already installed, you can install it by visiting https://curl.se/download.html. 


## Get the URL for your Gradio App 

To query a Gradio app, you'll need its full URL. This is usually just the URL that the Gradio app is hosted on, for example: https://bec81a83-5b5c-471e.gradio.live


**Hugging Face Spaces**

Note that if you are querying a Gradio on Hugging Face Spaces, you need to use the URL of the embedded Gradio app, not the URL of the Space. For example:

```bash
❌ Space URL: https://huggingface.co/spaces/abidlabs/en2fr
✅ Gradio app URL: https://abidlabs-en2fr.hf.space/
```

You can get the Gradio app URL by clicking the "view API" link at the bottom of the page, as discussed below. Or, you can right-click on the page and then click on "View Frame Source" or the equivalent in your browser to view the URL of the embedded Gradio app.

While you can use any public Space as an API, you may get rate limited by Hugging Face if you make too many requests. For unlimited usage of a Space, simply duplicate the Space to create a private Space,
and then use it to make as many requests as you'd like!

To query private Spaces, you will need to pass in your HF token. You can get your HF token here: https://huggingface.co/settings/tokens. In this case, you will need to include the following header in both of your `curl` calls that we'll discuss below:

```bash
-H "Authorization: Bearer $HF_TOKEN"
```


## cURL 1 

The simplest way to make a prediction is simply to call the `.predict()` function with the appropriate arguments:

```python
from gradio_client import Client

client = Client("abidlabs/en2fr", api_name='/predict')
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

It is recommended to provide key-word arguments instead of positional arguments:


```python
from gradio_client import Client

client = Client("gradio/calculator")
client.predict(num1=4, operation="add", num2=5)

>> 9.0
```

This allows you to take advantage of default arguments. For example, this Space includes the default value for the Slider component so you do not need to provide it when accessing it with the client.

```python
from gradio_client import Client

client = Client("abidlabs/image_generator")
client.predict(text="an astronaut riding a camel")
```

The default value is the initial value of the corresponding Gradio component. If the component does not have an initial value, but if the corresponding argument in the predict function has a default value of `None`, then that parameter is also optional in the client. Of course, if you'd like to override it, you can include it as well:

```python
from gradio_client import Client

client = Client("abidlabs/image_generator")
client.predict(text="an astronaut riding a camel", steps=25)
```

For providing files or URLs as inputs, you should pass in the filepath or URL to the file enclosed within `gradio_client.file()`. This takes care of uploading the file to the Gradio server and ensures that the file is preprocessed correctly:

```python
from gradio_client import Client, file

client = Client("abidlabs/whisper")
client.predict(
    audio=file("https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3")
)

>> "My thought I have nobody by a beauty and will as you poured. Mr. Rochester is serve in that so don't find simpus, and devoted abode, to at might in a r—"
```

## Running jobs asynchronously

Oe should note that `.predict()` is a _blocking_ operation as it waits for the operation to complete before returning the prediction.

In many cases, you may be better off letting the job run in the background until you need the results of the prediction. You can do this by creating a `Job` instance using the `.submit()` method, and then later calling `.result()` on the job to get the result. For example:

```python
from gradio_client import Client

client = Client(space="abidlabs/en2fr")
job = client.submit("Hello", api_name="/predict")  # This is not blocking

# Do something else

job.result()  # This is blocking

>> Bonjour
```

## The "View API" Page

As an alternative to running the `.view_api()` method, you can click on the "Use via API" link in the footer of the Gradio app, which shows us the same information, along with example usage. 

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/view-api.png)

The View API page also includes an "API Recorder" that lets you interact with the Gradio UI normally and converts your interactions into the corresponding code to run with the Python Client.
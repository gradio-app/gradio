# Using Hugging Face Integrations

Related spaces: https://huggingface.co/spaces/farukozderim/Model-Comparator-Space-Builder, https://huggingface.co/spaces/osanseviero/helsinki_translation_en_es, https://huggingface.co/spaces/osanseviero/remove-bg-webcam, https://huggingface.co/spaces/mrm8488/GPT-J-6B, https://huggingface.co/spaces/akhaliq/T0pp, https://huggingface.co/spaces/osanseviero/mix_match_gradio
Tags: HUB, SPACES, EMBED
Docs: examples

Contributed by <a href="https://huggingface.co/osanseviero">Omar Sanseviero</a> 🦙 and <a href="https://huggingface.co/farukozderim">Ömer Faruk Özdemir</a>

## Introduction

The Hugging Face Hub is a central platform that has over 30,000 [models](https://huggingface.co/models), 3,000 [datasets](https://huggingface.co/datasets) and 2,000 [demos](https://huggingface.co/spaces), also known as Spaces. From Natural Language Processing to Computer Vision and Speech, the Hub supports multiple domains. Although Hugging Face is famous for its 🤗 transformers library, the Hub also supports dozens of ML libraries, such as PyTorch, TensorFlow, spaCy, and many others.

Gradio has multiple features that make it extremely easy to leverage existing models and Spaces on the Hub. This guide walks through these features.

## Using regular inference with `pipeline`

First, let's build a simple interface that translates text from English to Spanish. Between the over a thousand models shared by the University of Helsinki, there is an [existing model](https://huggingface.co/Helsinki-NLP/opus-mt-en-es), `opus-mt-en-es`, that does precisely this!

The 🤗 transformers library has a very easy-to-use abstraction, [`pipeline()`](https://huggingface.co/docs/transformers/v4.16.2/en/main_classes/pipelines#transformers.pipeline) that handles most of the complex code to offer a simple API for common tasks. By specifying the task and an (optional) model, you can use an existing model with few lines:

```python
import gradio as gr

from transformers import pipeline

pipe = pipeline("translation", model="Helsinki-NLP/opus-mt-en-es")

def predict(text):
  return pipe(text)[0]["translation_text"]
  
iface = gr.Interface(
  fn=predict, 
  inputs='text',
  outputs='text',
  examples=[["Hello! My name is Omar"]]
)

iface.launch()
```

The previous code produces the following interface, which you can try right here in your browser: 

<iframe src="https://hf.space/embed/osanseviero/helsinki_translation_en_es/+" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

This demo requires installing four libraries: gradio, torch, transformers, and sentencepiece. Apart from that, this is a Gradio with the structure you're used to! The demo is a usual Gradio `Interface` with a prediction function, a specified input, and a specified output. The prediction function executes the `pipeline` function with the given input, retrieves the first (and only) translation result, and returns the `translation_text` field, which you're interested in.

## Using Hugging Face Inference API

Hugging Face has a service called the [Inference API](https://huggingface.co/inference-api) which allows you to send HTTP requests to models in the Hub. For transformers-based models, the API can be 2 to 10 times faster than running the inference yourself. The API has a friendly [free tier](https://huggingface.co/pricing).

Let's try the same demo as above but using the Inference API instead of loading the model yourself. Given a Hugging Face model supported in the Inference API, Gradio can automatically infer the expected input and output and make the underlying server calls, so you don't have to worry about defining the prediction function. Here is what the code would look like!

```python
import gradio as gr

iface = gr.Interface.load("huggingface/Helsinki-NLP/opus-mt-en-es",
  examples=[["Hello! My name is Omar"]]
)

iface.launch()
```

Let's go over some of the key differences:

* `Interface.load()` is used instead of the usual `Interface()`.
* `Interface.load()` receives a string with the prefix `huggingface/`, and then the model repository ID.
* Since the input, output and prediction functions are not needed, you only need to modify the UI parts (such as `title`, `description`, and `examples`).
* There is no need to install any dependencies (except Gradio) since you are not loading the model on your computer.

You might notice that the first inference takes about 20 seconds. This happens since the Inference API is loading the model in the server. You get some benefits afterward:

* The inference will be much faster.
* The server caches your requests.
* You get built-in automatic scaling.

## Hosting your Gradio demos


[Hugging Face Spaces](hf.co/spaces) allows anyone to host their Gradio demos freely. The community shares oven 2,000 Spaces. Uploading your Gradio demos take a couple of minutes. You can head to [hf.co/new-space](https://huggingface.co/new-space), select the Gradio SDK, create an `app.py` file, and voila! You have a demo you can share with anyone else.

## Building demos based on other demos

You can use the existing Spaces to tweak the UI or combine multiple demos. Let's find how to do this! First, let's take a look at an existing demo that does background removal. 

This is a Gradio demo [already shared](https://huggingface.co/spaces/eugenesiow/remove-bg) by a community member. You can load an existing demo using `Interface` in a syntax similar to how it's done for the Inference API. It just takes two lines of code and with the prefix `spaces`.

```python
import gradio as gr

gr.Interface.load("spaces/eugenesiow/remove-bg").launch()
```

The code snippet above will load the same interface as the corresponding Space demo.

<iframe src="https://hf.space/embed/eugenesiow/remove-bg/+" frameBorder="0" height="900" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


You can change UI elements, such as the title or theme, but also change the expected type. The previous Space expected users to upload images. What if you would like users to have their webcam and remove the background from there? You can load the Space but change the source of input as follows:

```python
import gradio as gr

gr.Interface.load(
  "spaces/eugenesiow/remove-bg", 
  inputs=[gr.Image(label="Input Image", source="webcam")]
).launch()
```

The code above generates the following demo.

<iframe src="https://hf.space/embed/osanseviero/remove-bg-webcam/+" frameBorder="0" height="600" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

As you can see, the demo looks the same, but it uses a webcam input instead of user-uploaded images.

You can learn more about this feature, and how to use it with the new Blocks API in the [Using Gradio Apps Like Functions guide](/using_apps_like_functions)

## Using multiple Spaces

Sometimes a single model inference will not be enough: you might want to call multiple models by piping them (using the output of model A as the input of model B). `Series` can achieve this. Other times, you might want to run two models in parallel to compare them. `Parallel` can do this!

Let's combine the notion of running things in parallel with the Spaces integration. The [GPT-J-6B](https://huggingface.co/spaces/mrm8488/GPT-J-6B) Space demos a model that generates text using a model called GPT-J. The [T0pp](https://huggingface.co/spaces/akhaliq/T0pp) Space demos another generative model called T0pp. Let's see how to combine both into one.

```python
import gradio as gr

iface1 = gr.Interface.load("spaces/mrm8488/GPT-J-6B")
iface2 = gr.Interface.load("spaces/akhaliq/T0pp")

iface3 = gr.mix.Parallel(
  iface1, iface2, 
  examples = [
    ['Which country will win the 2002 World Cup?'],
    ["A is the son's of B's uncle. What is the family relationship between A and B?"],
    ["In 2030, "],
  ])
  
iface3.launch()
```

`iface1` and `iface2` are loading existing Spaces. Then, with `Parallel`, you can run the interfaces parallelly. When you click submit, you will get the output for both interfaces. This is how the demo looks like:

<iframe src="https://hf.space/embed/osanseviero/mix_match_gradio/+" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

Although both models are generative, you can see that the way both models behave is very different. That's a powerful application of `Parallel`!

## Creating Spaces with python

Making use of the [huggingface_hub client library](https://huggingface.co/docs/huggingface_hub/index) library you can create new Spaces or model repositories. You can do this even in a Gradio Space! You can find an example space [here](https://huggingface.co/spaces/farukozderim/Model-Comparator-Space-Builder). This Space creates a new Space comparing different models or spaces with the support of Gradio `load` and `Parallel`. Now you can try creating cool spaces with all kinds of functionality 😎.

```python
from huggingface_hub import (
    create_repo,
    get_full_repo_name,
    upload_file,
)
create_repo(name=target_space_name, token=hf_token, repo_type="space", space_sdk="gradio")
repo_name = get_full_repo_name(model_id=target_space_name, token=hf_token)
file_url = upload_file(
    path_or_fileobj="file.txt",
    path_in_repo="app.py",
    repo_id=repo_name,
    repo_type="space",
    token=hf_token,
)
```
Here, `create_repo` creates a gradio repo with the target name under a specific account using that account's Write Token. `repo_name` gets the full repo name of the related repo. Finally `upload_file` uploads a file inside the repo with the name `app.py`.

<iframe src="https://hf.space/embed/farukozderim/Model-Comparator-Space-Builder/+" frameBorder="0" height="800" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


## Embedding your Space demo on other websites

Throughout this guide, you've seen there are Gradio demos embedded. You can also do this on own website! The first step is to create a Space with the demo you want to showcase. You can embed it in your HTML code, as shown in the following self-contained example.

```bash
&lt;iframe src="https://hf.space/embed/osanseviero/mix_match_gradio/+" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"&gt;&lt;/iframe&gt;
```

## Recap

That's it! Let's recap what you can do:

1. Host your Gradio demos in Spaces.
2. Use the Inference API to build demos in two lines of code.
3. Load existing Spaces and modify them.
4. Combine multiple Spaces by running them sequentially or parallelly.
5. Embed your Space demo directly on a website.

🤗

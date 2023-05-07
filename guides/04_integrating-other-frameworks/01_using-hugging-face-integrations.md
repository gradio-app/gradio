# Using Hugging Face Integrations

Related spaces: https://huggingface.co/spaces/gradio/helsinki_translation_en_es
Tags: HUB, SPACES, EMBED

Contributed by <a href="https://huggingface.co/osanseviero">Omar Sanseviero</a> 🦙 

## Introduction

The Hugging Face Hub is a central platform that has over 190,000 [models](https://huggingface.co/models), 32,000 [datasets](https://huggingface.co/datasets) and 40,000 [demos](https://huggingface.co/spaces), also known as Spaces. Although Hugging Face is famous for its 🤗 transformers and diffusers libraries, the Hub also supports dozens of ML libraries, such as PyTorch, TensorFlow, spaCy, and many others across a variety of domains, from computer vision to reinforcement learning.

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
  
demo = gr.Interface(
  fn=predict, 
  inputs='text',
  outputs='text',
)

demo.launch()
```

But `gradio` actually makes it even easier to convert a `pipeline` to a demo, simply by using the `gradio.Interface.from_pipeline` methods, which skips the need to specify the input and output components:

```python
from transformers import pipeline
import gradio as gr

pipe = pipeline("translation", model="Helsinki-NLP/opus-mt-en-es")

demo = gr.Interface.from_pipeline(pipe)
demo.launch()
```

The previous code produces the following interface, which you can try right here in your browser: 


<gradio-app space="Helsinki-NLP/opus-mt-en-es"></gradio-app>


## Using Hugging Face Inference API

Hugging Face has a free service called the [Inference API](https://huggingface.co/inference-api), which allows you to send HTTP requests to models in the Hub. For transformers or diffusers-based models, the API can be 2 to 10 times faster than running the inference yourself. The API is free (rate limited), and you can switch to dedicated [Inference Endpoints](https://huggingface.co/pricing) when you want to use it in production.

Let's try the same demo as above but using the Inference API instead of loading the model yourself. Given a Hugging Face model supported in the Inference API, Gradio can automatically infer the expected input and output and make the underlying server calls, so you don't have to worry about defining the prediction function. Here is what the code would look like!

```python
import gradio as gr

demo = gr.load("Helsinki-NLP/opus-mt-en-es", src="models")

demo.launch()
```

Notice that we just put specify the model name and state that the `src` should be `models` (Hugging Face's Model Hub). There is no need to install any dependencies (except `gradio`) since you are not loading the model on your computer.

You might notice that the first inference takes about 20 seconds. This happens since the Inference API is loading the model in the server. You get some benefits afterward:

* The inference will be much faster.
* The server caches your requests.
* You get built-in automatic scaling.

## Hosting your Gradio demos

[Hugging Face Spaces](https://hf.co/spaces) allows anyone to host their Gradio demos freely, and uploading your Gradio demos take a couple of minutes. You can head to [hf.co/new-space](https://huggingface.co/new-space), select the Gradio SDK, create an `app.py` file, and voila! You have a demo you can share with anyone else. To learn more, read [this guide how to host on Hugging Face Spaces using the website](https://huggingface.co/blog/gradio-spaces).


Alternatively, you can create a Space programmatically, making use of the [huggingface_hub client library](https://huggingface.co/docs/huggingface_hub/index) library. Here's an example:

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



## Embedding your Space demo on other websites

Throughout this guide, you've seen many embedded Gradio demos. You can also do this on own website! The first step is to create a Hugging Face Space with the demo you want to showcase. Then, [follow the steps here to embed the Space on your website](/sharing-your-app/#embedding-hosted-spaces).


## Loading demos from Spaces

You can also use and remix existing Gradio demos on Hugging Face Spaces. For example, you could take two existing Gradio demos and put them as separate tabs and create a new demo. You can run this new demo locally, or upload it to Spaces, allowing endless possibilities to remix and create new demos!

Here's an example that does exactly that:

```python
import gradio as gr

with gr.Blocks() as demo:
  with gr.Tab("Translate to Spanish"):
    gr.load("gradio/helsinki_translation_en_es", src="spaces")
  with gr.Tab("Translate to French"):
    gr.load("abidlabs/en2fr", src="spaces")

demo.launch()
```

Notice that we use `gr.load()`, the same method we used to load models using the Inference API. However, here we specify that the `src` is `spaces` (Hugging Face Spaces).

## Recap

That's it! Let's recap the various ways Gradio and Hugging Face work together:

1. You can convert a `transformers` pipeline into a Gradio demo using `from_pipeline()`
2. You can build a demo around the Inference API without having to load the model easily using `gr.load()`
3. You host your Gradio demo on Hugging Face Spaces, either using the GUI or entirely in Python.
4. You can embed Gradio demos that are hosted on Hugging Face Spaces onto your own website.
5. You can load demos from Hugging Face Spaces to remix and create new Gradio demos using `gr.load()`.


🤗

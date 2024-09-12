# Using Hugging Face Integrations

Related spaces: https://huggingface.co/spaces/gradio/en2es
Tags: HUB, SPACES, EMBED

Contributed by <a href="https://huggingface.co/osanseviero">Omar Sanseviero</a> 🦙

## Introduction

The Hugging Face Hub is a central platform that has hundreds of thousands of [models](https://huggingface.co/models), [datasets](https://huggingface.co/datasets) and [demos](https://huggingface.co/spaces) (also known as Spaces). 

Gradio has multiple features that make it extremely easy to leverage existing models and Spaces on the Hub. This guide walks through these features.


## Demos with the Hugging Face Inference Endpoints

Hugging Face has a service called [Serverless Inference Endpoints](https://huggingface.co/docs/api-inference/index), which allows you to send HTTP requests to models on the Hub. The API includes a generous free tier, and you can switch to [dedicated Inference Endpoints](https://huggingface.co/inference-endpoints/dedicated) when you want to use it in production. Gradio integrates directly with Serverless Inference Endpoints so that you can create a demo simply by specifying a model's name (e.g. `Helsinki-NLP/opus-mt-en-es`), like this:

```python
import gradio as gr

demo = gr.load("Helsinki-NLP/opus-mt-en-es", src="models")

demo.launch()
```

For any Hugging Face model supported in Inference Endpoints, Gradio automatically infers the expected input and output and make the underlying server calls, so you don't have to worry about defining the prediction function. 

Notice that we just put specify the model name and state that the `src` should be `models` (Hugging Face's Model Hub). There is no need to install any dependencies (except `gradio`) since you are not loading the model on your computer.

You might notice that the first inference takes a little bit longer. This happens since the Inference Endpoints is loading the model in the server. You get some benefits afterward:

- The inference will be much faster.
- The server caches your requests.
- You get built-in automatic scaling.

## Hosting your Gradio demos on Spaces

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


## Loading demos from Spaces

You can also use and remix existing Gradio demos on Hugging Face Spaces. For example, you could take two existing Gradio demos on Spaces and put them as separate tabs and create a new demo. You can run this new demo locally, or upload it to Spaces, allowing endless possibilities to remix and create new demos!

Here's an example that does exactly that:

```python
import gradio as gr

with gr.Blocks() as demo:
  with gr.Tab("Translate to Spanish"):
    gr.load("gradio/en2es", src="spaces")
  with gr.Tab("Translate to French"):
    gr.load("abidlabs/en2fr", src="spaces")

demo.launch()
```

Notice that we use `gr.load()`, the same method we used to load models using Inference Endpoints. However, here we specify that the `src` is `spaces` (Hugging Face Spaces). 

Note: loading a Space in this way may result in slight differences from the original Space. In particular, any attributes that apply to the entire Blocks, such as the theme or custom CSS/JS, will not be loaded. You can copy these properties from the Space you are loading into your own `Blocks` object. 

## Demos with the `Pipeline` in `transformers`

Hugging Face's popular `transformers` library has a very easy-to-use abstraction, [`pipeline()`](https://huggingface.co/docs/transformers/v4.16.2/en/main_classes/pipelines#transformers.pipeline) that handles most of the complex code to offer a simple API for common tasks. By specifying the task and an (optional) model, you can build a demo around an existing model with few lines of Python:

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

<gradio-app space="gradio/en2es"></gradio-app>


## Recap

That's it! Let's recap the various ways Gradio and Hugging Face work together:

1. You can build a demo around Inference Endpoints without having to load the model, by using `gr.load()`.
2. You host your Gradio demo on Hugging Face Spaces, either using the GUI or entirely in Python.
3. You can load demos from Hugging Face Spaces to remix and create new Gradio demos using `gr.load()`.
4. You can convert a `transformers` pipeline into a Gradio demo using `from_pipeline()`.

🤗

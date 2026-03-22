# Building AI Apps in Minutes with Gradio

Author: Gradio Team
Date: 2026-03-18
Tags: tutorial, getting-started, beginner

One of the most common questions we hear from ML practitioners is: "I have a model — how do I let people try it?" The answer is Gradio. In this post, we'll show you how to go from a Python function to a shareable web app in under five minutes.

## The Simplest Possible App

Let's start with the absolute basics. If you have a function, you have an app:

```python
import gradio as gr

def greet(name):
    return f"Hello, {name}! Welcome to Gradio."

demo = gr.Interface(fn=greet, inputs="text", outputs="text")
demo.launch()
```

That's it. Three lines of Gradio code and you have a working web application with a text input, a submit button, and a text output.

## Adding an ML Model

Now let's make it interesting. Here's a sentiment analysis app using a Hugging Face model:

```python
import gradio as gr
from transformers import pipeline

classifier = pipeline("sentiment-analysis")

def analyze(text):
    result = classifier(text)[0]
    return f"{result['label']} ({result['score']:.2%})"

demo = gr.Interface(
    fn=analyze,
    inputs=gr.Textbox(label="Enter text to analyze", lines=3),
    outputs=gr.Textbox(label="Sentiment"),
    title="Sentiment Analyzer",
    description="Enter any text and the model will predict its sentiment."
)

demo.launch()
```

## Sharing Your App

Once your app is running locally, sharing it with the world is one flag away:

```python
demo.launch(share=True)
```

This creates a public URL that anyone can access for 72 hours — no deployment, no infrastructure, no configuration.

## Going Further

For production deployments, you can host your Gradio apps on [Hugging Face Spaces](https://huggingface.co/spaces) for free. Just push your code to a Space repository and it will be automatically built and deployed.

Check out our [Quickstart Guide](/guides/quickstart) for more details, or explore the [API documentation](/docs) to see all the components and options available to you.

Happy building!

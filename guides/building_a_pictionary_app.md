# Building a Pictionary App

Related spaces: https://huggingface.co/spaces/nateraw/quickdraw
Tags: SKETCHPAD, LABELS, LIVE
Docs: image, label

## Introduction

How well can an algorithm guess what you're drawing? A few years ago, Google released the **Quick Draw** dataset, which contains drawings made by humans of a variety of every objects. Researchers have used this dataset to train models to guess Pictionary-style drawings. 

Such models are perfect to use with Gradio's *sketchpad* input, so in this tutorial we will build a Pictionary web application using Gradio. We will be able to build the whole web application in Python, and will look like this (try drawing something!):

<iframe src="https://hf.space/embed/abidlabs/draw2/+" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

Let's get started!

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). To use the pretrained sketchpad model, also install `torch`.

## Step 1 — Setting up the Sketch Recognition Model

First, you will need a sketch recognition model. Since many researchers have already trained their own models on the Quick Draw dataset, we will use a pretrained model in this tutorial. Our model is a light 1.5 MB  model trained by Nate Raw, that [you can download here](https://huggingface.co/spaces/nateraw/quickdraw/blob/main/pytorch_model.bin). 

If you are interested, here [is the code](https://github.com/nateraw/quickdraw-pytorch) that was used to train the model. We will simply load the pretrained model in PyTorch, as follows:

```python
import torch
from torch import nn

model = nn.Sequential(
    nn.Conv2d(1, 32, 3, padding='same'),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(32, 64, 3, padding='same'),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Conv2d(64, 128, 3, padding='same'),
    nn.ReLU(),
    nn.MaxPool2d(2),
    nn.Flatten(),
    nn.Linear(1152, 256),
    nn.ReLU(),
    nn.Linear(256, len(LABELS)),
)
state_dict = torch.load('pytorch_model.bin',    map_location='cpu')
model.load_state_dict(state_dict, strict=False)
model.eval()
```

## Step 2 — Defining a `predict` function

Next, you will need to define a function that takes in the *user input*, which in this case is a sketched image, and returns the prediction. The prediction should be returned as a dictionary whose keys are class name and values are confidence probabilities. We will load the class names from this [text file](https://huggingface.co/spaces/nateraw/quickdraw/blob/main/class_names.txt).

In the case of our pretrained model, it will look like this:

```python
from pathlib import Path

LABELS = Path('class_names.txt').read_text().splitlines()

def predict(img):
    x = torch.tensor(img, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 255.
    with torch.no_grad():
        out = model(x)
    probabilities = torch.nn.functional.softmax(out[0], dim=0)
    values, indices = torch.topk(probabilities, 5)
    confidences = {LABELS[i]: v.item() for i, v in zip(indices, values)}
    return confidences
```

Let's break this down. The function takes one parameters:

* `img`: the input image as a `numpy` array

Then, the function converts the image to a PyTorch `tensor`, passes it through the model, and returns:

* `confidences`: the top five predictions, as a dictionary whose keys are class labels and whose values are confidence probabilities

## Step 3 — Creating a Gradio Interface

Now that we have our predictive function set up, we can create a Gradio Interface around it. 

In this case, the input component is a sketchpad. To create a sketchpad input, we can use the convenient string shortcut, `"sketchpad"` which creates a canvas for a user to draw on and handles the preprocessing to convert that to a numpy array. 

The output component will be a `"label"`, which displays the top labels in a nice form.

Finally, we'll add one more parameter, setting `live=True`, which allows our interface to run in real time, adjusting its predictions every time a user draws on the sketchpad. The code for Gradio looks like this:

```python
import gradio as gr

gr.Interface(fn=predict, 
             inputs="sketchpad",
             outputs="label",
             live=True).launch()
```

This produces the following interface, which you can try right here in your browser (try drawing something, like a "snake" or a "laptop"):

<iframe src="https://hf.space/embed/abidlabs/draw2/+" frameBorder="0" height="450" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

----------

And you're done! That's all the code you need to build a Pictionary-style guessing app. Have fun and try to find some edge cases 🧐


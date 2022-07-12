# Image Classification in PyTorch

Related spaces: https://huggingface.co/spaces/abidlabs/pytorch-image-classifier, https://huggingface.co/spaces/pytorch/ResNet, https://huggingface.co/spaces/pytorch/ResNext, https://huggingface.co/spaces/pytorch/SqueezeNet
Tags: VISION, RESNET, PYTORCH
Docs: image, label, example

## Introduction

Image classification is a central task in computer vision. Building better classifiers to classify what object is present in a picture is an active area of research, as it has applications stretching from autonomous vehicles to medical imaging. 

Such models are perfect to use with Gradio's *image* input component, so in this tutorial we will build a web demo to classify images using Gradio. We will be able to build the whole web application in Python, and it will look like this (try one of the examples!):

<iframe src="https://hf.space/embed/abidlabs/pytorch-image-classifier/+" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


Let's get started!

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). We will be using a pretrained image classification model, so you should also have `torch` installed.

## Step 1 — Setting up the Image Classification Model

First, we will need an image classification model. For this tutorial, we will use a pretrained Resnet-18 model, as it is easily downloadable from [PyTorch Hub](https://pytorch.org/hub/pytorch_vision_resnet/). You can use a different pretrained model or train your own. 

```python
import torch

model = torch.hub.load('pytorch/vision:v0.6.0', 'resnet18', pretrained=True).eval()
```

Because we will be using the model for inference, we have called the `.eval()` method.

## Step 2 — Defining a `predict` function

Next, we will need to define a function that takes in the *user input*, which in this case is an image, and returns the prediction. The prediction should be returned as a dictionary whose keys are class name and values are confidence probabilities. We will load the class names from this [text file](https://git.io/JJkYN).

In the case of our pretrained model, it will look like this:

```python
import requests
from PIL import Image
from torchvision import transforms

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def predict(inp):
  inp = transforms.ToTensor()(inp).unsqueeze(0)
  with torch.no_grad():
    prediction = torch.nn.functional.softmax(model(inp)[0], dim=0)
    confidences = {labels[i]: float(prediction[i]) for i in range(1000)}    
  return confidences
```

Let's break this down. The function takes one parameter:

* `inp`: the input image as a `PIL` image

Then, the function converts the image to a PIL Image and then eventually a PyTorch `tensor`, passes it through the model, and returns:

* `confidences`: the predictions, as a dictionary whose keys are class labels and whose values are confidence probabilities

## Step 3 — Creating a Gradio Interface

Now that we have our predictive function set up, we can create a Gradio Interface around it. 

In this case, the input component is a drag-and-drop image component. To create this input, we use `Image(type="pil")` which creates the component and handles the preprocessing to convert that to a `PIL` image. 

The output component will be a `Label`, which displays the top labels in a nice form. Since we don't want to show all 1,000 class labels, we will customize it to show only the top 3 images by constructing it as `Label(num_top_classes=3)`.

Finally, we'll add one more parameter, the `examples`, which allows us to prepopulate our interfaces with a few predefined examples. The code for Gradio looks like this:

```python
import gradio as gr

gr.Interface(fn=predict, 
             inputs=gr.inputs.Image(type="pil"),
             outputs=gr.outputs.Label(num_top_classes=3),
             examples=["lion.jpg", "cheetah.jpg"]).launch()
```

This produces the following interface, which you can try right here in your browser (try uploading your own examples!):

<iframe src="https://hf.space/embed/abidlabs/pytorch-image-classifier/+" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

----------

And you're done! That's all the code you need to build a web demo for an image classifier. If you'd like to share with others, try setting `share=True` when you `launch()` the Interface!


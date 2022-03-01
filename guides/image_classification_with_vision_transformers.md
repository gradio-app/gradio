# Image Classification with Vision Transformers

related_spaces: https://huggingface.co/spaces/abidlabs/vision-transformer
tags: VISION, TRANSFORMERS, HUB

## Introduction

Image classification is a central task in computer vision. Building better classifiers to classify what object is present in a picture is an active area of research, as it has applications stretching from facial recognition to manufacturing quality control. 

State-of-the-art image classifiers are based on the *transformers* architectures, originally popularized for NLP tasks. Such architectures are typically called vision transformers (ViT). Such models are perfect to use with Gradio's *image* input component, so in this tutorial we will build a web demo to classify images using Gradio. We will be able to build the whole web application in a **single line of Python**, and it will look like this (try one of the examples!):

<iframe src="https://hf.space/gradioiframe/abidlabs/vision-transformer/+" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


Let's get started!

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started).

## Step 1 — Choosing a Vision Image Classification Model

First, we will need an image classification model. For this tutorial, we will use a model from the [Hugging Face Model Hub](https://huggingface.co/models?pipeline_tag=image-classification). The Hub contains thousands of models covering dozens of different machine learning tasks. 

Expand the Tasks category on the left sidebar and select "Image Classification" as our task of interest. You will then see all of the models on the Hub that are designed to classify images.

At the time of writing, the most popular one is `google/vit-base-patch16-224`, which has been trained on ImageNet images at a resolution of 224x224 pixels. We will use this model for our demo. 

## Step 2 — Loading the Vision Transformer Model with Gradio

When using a model from the Hugging Face Hub, we do not need to define the input or output components for the demo. Similarly, we do not need to be concerned with the details of preprocessing or postprocessing. 
All of these are automatically inferred from the model tags.

Besides the import statement, it only takes a single line of Python to load and launch the demo. 

We use the `gr.Interface.load()` method and pass in the path to the model including the  `huggingface/` to designate that it is from the Hugging Face Hub.

```python
import gradio as gr

gr.Interface.load(
             "huggingface/google/vit-base-patch16-224",
             examples=["alligator.jpg", "laptop.jpg"]).launch()
```

Notice that we have added one more parameter, the `examples`, which allows us to prepopulate our interfaces with a few predefined examples. 

This produces the following interface, which you can try right here in your browser. When you input an image, it is automatically preprocessed and sent to the Hugging Face Hub API, where it is passed through the model and returned as a human-interpretable prediction.  Try uploading your own image!

<iframe src="https://hf.space/gradioiframe/abidlabs/vision-transformer/+" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

----------

And you're done! In one line of code, you have built a web demo for an image classifier. If you'd like to share with others, try setting `share=True` when you `launch()` the Interface!


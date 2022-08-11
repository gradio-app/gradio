# Image Classification in TensorFlow and Keras

Related spaces: https://huggingface.co/spaces/abidlabs/keras-image-classifier
Tags: VISION, MOBILENET, TENSORFLOW

## Introduction

Image classification is a central task in computer vision. Building better classifiers to classify what object is present in a picture is an active area of research, as it has applications stretching from traffic control systems to satellite imaging. 

Such models are perfect to use with Gradio's *image* input component, so in this tutorial we will build a web demo to classify images using Gradio. We will be able to build the whole web application in Python, and it will look like this (try one of the examples!):

<iframe src="https://hf.space/embed/abidlabs/keras-image-classifier/+" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


Let's get started!

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). We will be using a pretrained Keras image classification model, so you should also have `tensorflow` installed.

## Step 1 — Setting up the Image Classification Model

First, we will need an image classification model. For this tutorial, we will use a pretrained Mobile Net model, as it is easily downloadable from [Keras](https://keras.io/api/applications/mobilenet/). You can use a different pretrained model or train your own. 

```python
import tensorflow as tf

inception_net = tf.keras.applications.MobileNetV2()
```

This line automatically downloads the MobileNet model and weights using the Keras library.  

## Step 2 — Defining a `predict` function

Next, we will need to define a function that takes in the *user input*, which in this case is an image, and returns the prediction. The prediction should be returned as a dictionary whose keys are class name and values are confidence probabilities. We will load the class names from this [text file](https://git.io/JJkYN).

In the case of our pretrained model, it will look like this:

```python
import requests

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def classify_image(inp):
  inp = inp.reshape((-1, 224, 224, 3))
  inp = tf.keras.applications.mobilenet_v2.preprocess_input(inp)
  prediction = inception_net.predict(inp).flatten()
  confidences = {labels[i]: float(prediction[i]) for i in range(1000)}
  return confidences
```

Let's break this down. The function takes one parameter:

* `inp`: the input image as a `numpy` array

Then, the function adds a batch dimension, passes it through the model, and returns:

* `confidences`: the predictions, as a dictionary whose keys are class labels and whose values are confidence probabilities

## Step 3 — Creating a Gradio Interface

Now that we have our predictive function set up, we can create a Gradio Interface around it. 

In this case, the input component is a drag-and-drop image component. To create this input, we can use the `"gradio.inputs.Image"` class, which creates the component and handles the preprocessing to convert that to a numpy array. We will instantiate the class with a parameter that automatically preprocesses the input image to be 224 pixels by 224 pixels, which is the size that MobileNet expects.

The output component will be a `"label"`, which displays the top labels in a nice form. Since we don't want to show all 1,000 class labels, we will customize it to show only the top 3 images.

Finally, we'll add one more parameter, the `examples`, which allows us to prepopulate our interfaces with a few predefined examples. The code for Gradio looks like this:

```python
import gradio as gr

gr.Interface(fn=classify_image, 
             inputs=gr.Image(shape=(224, 224)),
             outputs=gr.Label(num_top_classes=3),
             examples=["banana.jpg", "car.jpg"]).launch()
```

This produces the following interface, which you can try right here in your browser (try uploading your own examples!):

<iframe src="https://hf.space/embed/abidlabs/keras-image-classifier/+" frameBorder="0" height="660" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

----------

And you're done! That's all the code you need to build a web demo for an image classifier. If you'd like to share with others, try setting `share=True` when you `launch()` the Interface!


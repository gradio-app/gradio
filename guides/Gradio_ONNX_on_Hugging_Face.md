# Building_from_the_ONNX_Model_Zoo

related_spaces: https://huggingface.co/spaces/onnx/EfficientNet-Lite4
tags: ONNX, SPACES

## Introduction

In this Guide, we'll walk you through:

* Introduction of ONNX, ONNX model zoo, Gradio, and Hugging Face Spaces
* How to setup a Gradio demo for EfficientNet-Lite4
* How to contribute your own Gradio demos for the ONNX organization on Hugging Face

Here's an example of an ONNX model: try out the EfficientNet-Lite4 demo below:

<iframe src="https://hf.space/embed/onnx/EfficientNet-Lite4/+" frameBorder="0" height="810" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## What is the ONNX Model Zoo?
Open Neural Network Exchange ([ONNX](https://onnx.ai/)) is an open standard format for representing machine learning models. ONNX is supported by a community of partners who have implemented it in many frameworks and tools. For example, if you have trained a model in TensorFlow or PyTorch, you can convert it to ONNX easily, and from there run it on a variety of devices using an engine/compiler like ONNX Runtime.

The [ONNX Model Zoo](https://github.com/onnx/models) is a collection of pre-trained, state-of-the-art models in the ONNX format contributed by community members. Accompanying each model are Jupyter notebooks for model training and running inference with the trained model. The notebooks are written in Python and include links to the training dataset as well as references to the original paper that describes the model architecture.


## What is Hugging Face Spaces & Gradio?

### Gradio

Gradio lets users demo their machine learning models as a web app all in python code. Gradio wraps a python function into a user inferface and the demos can be launched inside jupyter notebooks, colab notebooks, as well as embedded in your own website and hosted on Hugging Face Spaces for free.

Get started here: https://gradio.app/getting_started

### Hugging Face Spaces

Hugging Face Spaces is a free hosting option for Gradio demos. Spaces comes with 3 SDK options: Gradio, Streamlit and Static HTML demos. Spaces can be public or private and the workflow is similar to github repos. There are over 2000+ spaces currently on Hugging Face. To learn more about spaces see: https://huggingface.co/spaces/launch

### Hugging Face Models

Hugging Face Model Hub also supports ONNX models and ONNX models can be filtered through the [ONNX tag](https://huggingface.co/models?library=onnx&sort=downloads)

## How did Hugging Face help the ONNX Model Zoo?
There are a lot of Jupyter notebooks in the ONNX Model Zoo for users to test models. Previously users needed to download the models themselves and run those notebooks locally for testing. With Hugging Face, the testing process can be much simpler and more user-friendly. Users can easily try certain ONNX Model Zoo model on Hugging Face Spaces and run a quick demo powered by Gradio with ONNX Runtime, all on cloud without downloading anything locally. Note that there are various runtimes for ONNX, e.g., [ONNX Runtime](https://github.com/microsoft/onnxruntime), [MXNet](https://github.com/apache/incubator-mxnet).

## What is role of ONNX Runtime?
ONNX Runtime is a cross-platform inference and training machine-learning accelerator. It makes live Gradio demo with ONNX Model Zoo model on Hugging Face possible.

ONNX Runtime inference can enable faster customer experiences and lower costs, supporting models from deep learning frameworks such as PyTorch and TensorFlow/Keras as well as classical machine learning libraries such as scikit-learn, LightGBM, XGBoost, etc. ONNX Runtime is compatible with different hardware, drivers, and operating systems, and provides optimal performance by leveraging hardware accelerators where applicable alongside graph optimizations and transforms. For more information please see the [official website](https://onnxruntime.ai/).

## Setting up a Gradio Demo for EfficientNet-Lite4

EfficientNet-Lite 4 is the largest variant and most accurate of the set of EfficientNet-Lite model. It is an integer-only quantized model that produces the highest accuracy of all of the EfficientNet models. It achieves 80.4% ImageNet top-1 accuracy, while still running in real-time (e.g. 30ms/image) on a Pixel 4 CPU. To learn more read the [model card](https://github.com/onnx/models/tree/main/vision/classification/efficientnet-lite4)

Here we walk through setting up a example demo for EfficientNet-Lite4 using Gradio

First we import our dependencies and download and load the efficientnet-lite4 model from the onnx model zoo. Then load the labels from the labels_map.txt file. We then setup our preprocessing functions, load the model for inference, and setup the inference function. Finally, the inference function is wrapped into a gradio inferface for a user to interact with. See the full code below.


```python
import numpy as np
import math
import matplotlib.pyplot as plt
import cv2
import json
import gradio as gr
from huggingface_hub import hf_hub_download
from onnx import hub
import onnxruntime as ort

# loads ONNX model from ONNX Model Zoo
model = hub.load("efficientnet-lite4")
# loads the labels text file
labels = json.load(open("labels_map.txt", "r"))

# sets image file dimensions to 224x224 by resizing and cropping image from center
def pre_process_edgetpu(img, dims):
    output_height, output_width, _ = dims
    img = resize_with_aspectratio(img, output_height, output_width, inter_pol=cv2.INTER_LINEAR)
    img = center_crop(img, output_height, output_width)
    img = np.asarray(img, dtype='float32')
    # converts jpg pixel value from [0 - 255] to float array [-1.0 - 1.0]
    img -= [127.0, 127.0, 127.0]
    img /= [128.0, 128.0, 128.0]
    return img

# resizes the image with a proportional scale
def resize_with_aspectratio(img, out_height, out_width, scale=87.5, inter_pol=cv2.INTER_LINEAR):
    height, width, _ = img.shape
    new_height = int(100. * out_height / scale)
    new_width = int(100. * out_width / scale)
    if height > width:
        w = new_width
        h = int(new_height * height / width)
    else:
        h = new_height
        w = int(new_width * width / height)
    img = cv2.resize(img, (w, h), interpolation=inter_pol)
    return img

# crops the image around the center based on given height and width
def center_crop(img, out_height, out_width):
    height, width, _ = img.shape
    left = int((width - out_width) / 2)
    right = int((width + out_width) / 2)
    top = int((height - out_height) / 2)
    bottom = int((height + out_height) / 2)
    img = img[top:bottom, left:right]
    return img


sess = ort.InferenceSession(model)

def inference(img):
  img = cv2.imread(img)
  img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
  
  img = pre_process_edgetpu(img, (224, 224, 3))
  
  img_batch = np.expand_dims(img, axis=0)

  results = sess.run(["Softmax:0"], {"images:0": img_batch})[0]
  result = reversed(results[0].argsort()[-5:])
  resultdic = {}
  for r in result:
      resultdic[labels[str(r)]] = float(results[0][r])
  return resultdic
  
title = "EfficientNet-Lite4"
description = "EfficientNet-Lite 4 is the largest variant and most accurate of the set of EfficientNet-Lite model. It is an integer-only quantized model that produces the highest accuracy of all of the EfficientNet models. It achieves 80.4% ImageNet top-1 accuracy, while still running in real-time (e.g. 30ms/image) on a Pixel 4 CPU."
examples = [['catonnx.jpg']]
gr.Interface(inference, gr.inputs.Image(type="filepath"), "label", title=title, description=description, examples=examples).launch()
```


## Get started: How to contribute Gradio demos on HF spaces using ONNX models

* Create an account on Hugging Face: https://huggingface.co/join
* See list of models left to add to ONNX organization, please refer to the table with the [Models list](https://github.com/onnx/models#models)
* Add Gradio Demo under your username, see blog for setting up Gradio Demo on Hugging Face: https://huggingface.co/blog/gradio-spaces
* Request to join ONNX Organization: https://huggingface.co/onnx
* Once approved transfer model from your username to ONNX organization
* Add a badge for model in model table, see examples in [Models list](https://github.com/onnx/models#models)

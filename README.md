[![CircleCI](https://circleci.com/gh/gradio-app/gradio-UI.svg?style=svg)](https://circleci.com/gh/gradio-app/gradio) [![PyPI version](https://badge.fury.io/py/gradio.svg)](https://badge.fury.io/py/gradio)

# Gradio UI

<img src="https://i.ibb.co/GHRk2JP/header-2.png" alt="drawing" width="1000"/>

At Gradio, we often try to understand what inputs a model is particularly sensitive to. To help facilitate this, we've developed and open-sourced `gradio`, a python library that allows you to quickly create input and output interfaces over trained models to make it easy for you to "play around" with your model in your browser by dragging-and-dropping in your own images (or pasting your own text, recording your own voice, etc.) and seeing what the model outputs. `gradio` also allows you to generate a share link which allows anyone, anywhere to use the interface as the model continues to run on your machine. 

Gradio is useful for:
* Creating demos of your machine learning code for clients / collaborators / users
* Getting feedback on model performance from users
* Debugging your model interactively during development

To get a sense of `gradio`, take a look at a few of these examples and colab notebooks, and find more on our website: www.gradio.app.

## Installation
```
pip install gradio
```
(you may need to replace `pip` with `pip3` if you're running `python3`).

## Usage

Gradio is very easy to use with your existing code. Here are a few working examples:

### 0. Hello World [![alt text](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/18ODkJvyxHutTN0P5APWyGFO_xwNcgHDZ?usp=sharing)

Let's start with a basic function (no machine learning yet!) that greets an input name. We'll wrap the function with a `Text` to `Text` interface.

```python
import gradio as gr

def greet(name):
  return "Hello " + name + "!"

gr.Interface(fn=greet, inputs="text", outputs="text").launch()
```

The core Interface class is initialized with three parameters:

- `fn`: the function to wrap
- `inputs`: the name of the input interface
- `outputs`: the name of the output interface

Calling the `launch()` function of the `Interface` object produces the interface shown in image below.

![alt text](https://i.ibb.co/Z8p7gLZ/hello-world.png)

### 1. Inception Net [![alt text](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1c6gQiW88wKBwWq96nqEwuQ1Kyt5LejiU?usp=sharing)

Now, let's do a machine learning example. We're going to wrap an
interface around the InceptionV3 image classifier, which we'll load
using Tensorflow! Since this is an image classification model, we will use the `Image` input interface.
We'll output a dictionary of labels and their corresponding confidence scores with the `Label` output
interface. (The original Inception Net architecture [can be found here](https://arxiv.org/abs/1409.4842))

```python
import gradio as gr
import tensorflow as tf
import numpy as np
import requests

inception_net = tf.keras.applications.InceptionV3() # load the model

# Download human-readable labels for ImageNet.
response = requests.get("https://git.io/JJkYN")
labels = response.text.split("\n")

def classify_image(inp):
  inp = inp.reshape((-1, 299, 299, 3))
  inp = tf.keras.applications.inception_v3.preprocess_input(inp)
  prediction = inception_net.predict(inp).flatten()
  return {labels[i]: float(prediction[i]) for i in range(1000)}

image = gr.inputs.Image(shape=(299, 299, 3))
label = gr.outputs.Label(num_top_classes=3)

gr.Interface(fn=classify_image, inputs=image, outputs=label).launch()
```
This code will produce the interface below. The interface gives you a way to test
Inception Net by dragging and dropping images, and also allows you to use naturally modify the input image using image editing tools that
appear when you click EDIT. Notice here we provided actual `gradio.inputs` and `gradio.outputs` objects to the Interface
function instead of using string shortcuts. This lets us use built-in preprocessing (e.g. image resizing)
and postprocessing (e.g. choosing the number of labels to display) provided by these
interfaces.

![alt text](https://i.ibb.co/BtRNc62/inception-net.png)

You can supply your own model instead of the pretrained model above, as well as use different kinds of models or functions. Here's a list of the interfaces we currently support, along with their preprocessing / postprocessing parameters:

**Input Interfaces**:
- Sketchpad(shape=(28, 28), invert_colors=True, flatten=False, scale=1/255, shift=0, dtype='float64')
- Webcam(image_width=224, image_height=224, num_channels=3, label=None)
- Textbox(lines=1, placeholder=None, label=None, numeric=False)
- Radio(choices, label=None)
- Dropdown(choices, label=None)
- CheckboxGroup(choices, label=None)
- Slider(minimum=0, maximum=100, default=None, label=None)
- Image(shape=(224, 224, 3), image_mode='RGB', scale=1/127.5, shift=-1, label=None)
- Microphone()

**Output Interfaces**:
- Label(num_top_classes=None, label=None)
- KeyValues(label=None)
- Textbox(lines=1, placeholder=None, label=None)
- Image(label=None, plot=False)

Interfaces can also be combined together, for multiple-input or multiple-output models. 

### 2. Real-Time MNIST [![alt text](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1LXJqwdkZNkt1J_yfLWQ3FLxbG2cAF8p4?usp=sharing)

Let's wrap a fun `Sketchpad`-to-`Label` UI around MNIST. For this example, we'll take advantage of the `live`
feature in the library. Set `live=True` inside `Interface()`> to have it run continuous predictions.
We've abstracted the model training from the code below, but you can see the full code on the colab link.

```python
import tensorflow as tf
import gradio as gr
from urllib.request import urlretrieve

urlretrieve("https://gr-models.s3-us-west-2.amazonaws.com/mnist-model.h5","mnist-model.h5")
model = tf.keras.models.load_model("mnist-model.h5")

def recognize_digit(inp):
    prediction = model.predict(inp.reshape(1, 28, 28, 1)).tolist()[0]
    return {str(i): prediction[i] for i in range(10)}

sketchpad = gr.inputs.Sketchpad()
label = gr.outputs.Label(num_top_classes=3)

gr.Interface(fn=recognize_digit, inputs=sketchpad,
  outputs=label, live=True).launch()
```

This code will produce the interface below.

![alt text](https://i.ibb.co/9n2mGgk/mnist-live.png)

You can find many more examples on our website (GPT-2, model comparison, multiple inputs, numerical interfaces): www.gradio.app

## Contributing:
If you would like to contribute and your contribution is small, you can directly open a pull request (PR). If you would like to contribute a larger feature, we recommend first creating an issue with a proposed design for discussion. Please see our contributing guidelines for more info.

## License:
Gradio is licensed under the Apache License 2.0

## See more:
Find more info on usage here: www.gradio.app.

See, also, the accompanying paper: ["Gradio: Hassle-Free Sharing and Testing of ML Models in the Wild"](https://arxiv.org/pdf/1906.02569.pdf), *ICML HILL 2019*, and please use the citation below.

```
@article{abid2019gradio,
title={Gradio: Hassle-Free Sharing and Testing of ML Models in the Wild},
author={Abid, Abubakar and Abdalla, Ali and Abid, Ali and Khan, Dawood and Alfozan, Abdulrahman and Zou, James},
journal={arXiv preprint arXiv:1906.02569},
year={2019}
}
```



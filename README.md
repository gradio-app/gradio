[![CircleCI](https://circleci.com/gh/gradio-app/gradio-UI.svg?style=svg)](https://circleci.com/gh/gradio-app/gradio) [![PyPI version](https://badge.fury.io/py/gradio.svg)](https://badge.fury.io/py/gradio)

# Gradio UI

![alt text](https://i.ibb.co/GHRk2JP/header-2.png)

At Gradio, we often try to understand what inputs that a model is particularly sensitive to. To help facilitate this, we've developed and open-sourced `gradio`, a python library that allows you to easily create input and output interfaces over trained models to make it easy for you to "play around" with your model in your browser by dragging-and-dropping in your own images (or pasting your own text, recording your own voice, etc.) and seeing what the model outputs. We are working on making creating a shareable, public link to your model so you can share the interface with others (e.g. your client, your advisor, or your dad), who can use the model without writing any code. 

Gradio is useful for:
* Creating demos of your machine learning code for clients / collaborators / users
* Getting feedback on model performance from users
* Debugging your model interactively during development

For more details, see the accompanying paper: ["Gradio: Hassle-Free Sharing and Testing of ML Models in the Wild"](https://arxiv.org/pdf/1906.02569.pdf), *ICML HILL 2019*, and please use the citation below.

```
@article{abid2019gradio,
title={Gradio: Hassle-Free Sharing and Testing of ML Models in the Wild},
author={Abid, Abubakar and Abdalla, Ali and Abid, Ali and Khan, Dawood and Alfozan, Abdulrahman and Zou, James},
journal={arXiv preprint arXiv:1906.02569},
year={2019}
}
```

To get a sense of `gradio`, take a look at the at the `examples` and `demo` folders, or read on below! And be sure to visit the gradio website: www.gradio.app.

## Installation
```
pip install gradio
```
(you may need to replace `pip` with `pip3` if you're running `python3`).

## Usage

Gradio is very easy to use with your existing code. Here's a working example:


```python
import gradio
import tensorflow as tf
from imagenetlabels import idx_to_labels

def classify_image(inp):
    inp = inp.reshape((1, 224, 224, 3))
    prediction = mobile_net.predict(inp).flatten()
    return {idx_to_labels[i].split(',')[0]: float(prediction[i]) for i in range(1000)}

imagein = gradio.inputs.Image(shape=(224, 224, 3))
label = gradio.outputs.Label(num_top_classes=3)

gr.Interface(classify_image, imagein, label, capture_session=True).launch();
```

![alt text](https://i.ibb.co/nM97z2B/image-interface.png)


You can supply your own model instead of the pretrained model above, as well as use different kinds of models or functions. Changing the `input` and `output` parameters in the `Interface` face object allow you to create different interfaces, depending on the needs of your model. Take a look at the python notebooks for more examples. The currently supported interfaces are as follows:

**Input interfaces**:
* Sketchpad
* ImageUplaod
* Webcam
* Textbox

**Output interfaces**:
* Label
* Textbox

## Screenshots

Here are a few screenshots that show examples of gradio interfaces

#### MNIST Digit Recognition (Input: Sketchpad, Output: Label)

```python
sketchpad = Sketchpad()
label = Label(num_top_classes=4)

gradio.Interface(predict, sketchpad, label).launch();
```

![alt text](https://i.ibb.co/CV8Kk3D/sketchpad-interface.png)

#### Human DNA Variant Effect Prediction (Input: Textbox, Output: Label)

```python
gradio.Interface(predict, 'textbox', 'label').launch()
```

![alt text](https://i.ibb.co/C7GXDDQ/label-interface.png)

### Contributing:
If you would like to contribute and your contribution is small, you can directly open a pull request (PR). If you would like to contribute a larger feature, we recommend first creating an issue with a proposed design for discussion. Please see our contributing guidelines for more info.

### See more:
Find more info on usage here: www.gradio.app.



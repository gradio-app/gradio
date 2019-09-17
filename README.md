# About Gradio

Gradio reduces the amount of data that a company needs to collect and label in order to build high-performing artificial intelligent systems. 

The biggest bottleneck in building artificial intelligence systems is acquiring and labeling data. This process requires huge amounts of human labor and often requires domain expertise (e.g. costly lawyers to label contracts, costly doctors to label medical images). Applying recent machine learning research from Stanford, Gradio reduces the amount of data that an AI company needs to collect and label, often by as much as half. 

This is achieved through: (1) identifying and correcting mislabelled data;  (2) valuing each datapoint to automatically identify which data points should be labeled; and (3) intelligently augmenting data to diversify and maximize the value of the dataset. (See figure below.)




# Gradio UI Tool
[![CircleCI](https://circleci.com/gh/gradio-app/gradio.svg?style=svg)](https://circleci.com/gh/gradio-app/gradio)

As part of our work, we often try to understand what inputs that a model is particularly sensitive to. To help facilitate this, we've developed and open-sourced `gradio`, a python library that allows you to easily create input and output interfaces over trained models to make it easy for you to "play around" with your model in your browser by dragging-and-dropping in your own images (or pasting your own text, recording your own voice, etc.) and seeing what the model outputs. The library also automatically creates a shareable, public link to your model so you can share the interface with others (e.g. your client, your advisor, or your dad), who can use the model without writing any code. 

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

To get a sense of `gradio`, take a look at the  python notebooks in the `examples` folder, or read on below! And be sure to visit the gradio website: www.gradio.app.

## Installation
```
pip install gradio
```
(you may need to replace `pip` with `pip3` if you're running `python3`).

## Usage

Gradio is very easy to use with your existing code. Here is a minimum working example:


```python
import gradio
import tensorflow as tf
image_mdl = tf.keras.applications.inception_v3.InceptionV3()

io = gradio.Interface(inputs="imageupload", outputs="label", model_type="keras", model=image_mdl)
io.launch()
```

You can supply your own model instead of the pretrained model above, as well as use different kinds of models, not just keras models. Changing the `input` and `output` parameters in the `Interface` face object allow you to create different interfaces, depending on the needs of your model. Take a look at the python notebooks for more examples. The currently supported interfaces are as follows:

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
iface = gradio.Interface(input='sketchpad', output='label', model=model, model_type='keras')
iface.launch()
```

![alt text](https://raw.githubusercontent.com/abidlabs/gradio/master/screenshots/sketchpad_interface.png)

#### Image Classifier: InceptionNet (Input: Webcam, Output: Label)

```python
iface = gradio.Interface(inputs='webcam', outputs='label', model=model, model_type='keras')
iface.launch()
```

![alt text](https://raw.githubusercontent.com/abidlabs/gradio/master/screenshots/image_interface.png)

#### Human DNA Variant Effect Prediction (Input: Textbox, Output: Label)

```python
iface = gradio.Interface(inputs='textbox', outputs='label', model=model, model_type='keras')
iface.launch()
```

![alt text](https://raw.githubusercontent.com/abidlabs/gradio/master/screenshots/label_interface.png)

### More Documentation

More detailed and up-to-date documentation can be found on the gradio website: www.gradio.app.



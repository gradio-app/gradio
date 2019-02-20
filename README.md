# Gradiome / Gradio

`Gradio` is a python library that allows you to place input and output interfaces over trained models to make it easy for you to "play around" with your model. Gradio runs entirely locally using your browser.

To get a sense of `gradio`, take a look at the  python notebooks in the `examples` folder, or read on below!

## Installation
```
pip install gradio
```
(you may need to replace `pip` with `pip3` if you're running `python3`).

## Usage

Gradio is very easy to use with your existing code. The general way it's used is something like this:


```python
import tensorflow as tf
import gradio

mdl = tf.keras.models.Sequential()
# ... define and train the model as you would normally

iface = gradio.Interface(input=“sketchpad”, output=“class”, model_type=“keras”, model=mdl)
iface.launch()
```

Changing the `input` and `output` parameters in the `Interface` face object allow you to create different interfaces, depending on the needs of your model. Take a look at the python notebooks for more examples. The currently supported interfaces are as follows:

**Input interfaces**:
* Sketchpad
* ImageUplaod
* Webcam
* Textbox

**Output interfaces**:
* Class
* Textbox

## Screenshots

Here are a few screenshots that show examples of gradio interfaces

#### MNIST Digit Recognition (Input: Sketchpad, Output: Class)

```python
iface = gradio.Interface(input='sketchpad', output='class', model=model, model_type='keras')
iface.launch()
```

![alt text](https://raw.githubusercontent.com/abidlabs/gradio/master/screenshots/mnist4.png)

#### Facial Emotion Detector (Input: Webcam, Output: Class)

```python
iface = gradio.Interface(input='webcam', output='class', model=model, model_type='keras')
iface.launch()
```

![alt text](https://raw.githubusercontent.com/abidlabs/gradio/master/screenshots/webcam_happy.png)

#### Sentiment Analysis (Input: Textbox, Output: Class)

```python
iface = gradio.Interface(input='textbox', output='class', model=model, model_type='keras')
iface.launch()
```

![alt text](https://raw.githubusercontent.com/abidlabs/gradio/master/screenshots/sentiment_positive.png)




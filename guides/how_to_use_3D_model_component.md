# How to Use the 3D Model Component

Related spaces: https://huggingface.co/spaces/dawood/Model3D, https://huggingface.co/spaces/radames/PIFu-Clothed-Human-Digitization, https://huggingface.co/spaces/radames/dpt-depth-estimation-3d-obj
Tags: VISION, IMAGE
Docs: model3D

## Introduction

3D models are becoming more popular in machine learning and make for some of the most fun demos to experiment with. Using `gradio`, you can easily build a demo of your 3D image model and share it with anyone. The Gradio 3D Model component accepts 3 file types including: *.obj*, *.glb*, & *.gltf*.

This guide will show you how to build a demo for your 3D image model in a few lines of code; like the one below. Play around with 3D object by clicking around, dragging and zooming:

<iframe src="https://hf.space/embed/dawood/Model3D/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started).


## Taking a Look at the Code

Let's take a look at how to create the minimal interface above. The prediction function in this case will just return the original 3D model mesh, but you can change this function to run inference on your machine learning model. We'll take a look at more complex examples below.

```python
import gradio as gr

def load_mesh(mesh_file_name):
    return mesh_file_name

demo = gr.Interface(
    fn=load_mesh,
    inputs=gr.Model3D(),
    outputs=gr.Model3D(clear_color=[0.0, 0.0, 0.0, 0.0],  label="3D Model"),
    examples=[
        ["files/Bunny.obj"],
        ["files/Duck.glb"],
        ["files/Fox.gltf"],
        ["files/face.obj"],
    ],
    cache_examples=True,
)

demo.launch()
```

Let's break down the code above:

`load_mesh`: This is our 'prediction' function and for simplicity, this function will take in the 3D model mesh and return it.

Creating the Interface:

* `fn`: the prediction function that is used when the user clicks submit. In our case this is the `load_mesh` function.
* `inputs`: create a model3D input component. The input expects an uploaded file as a {str} filepath.
* `outputs`: create a model3D output component. The output component also expects a file as a {str} filepath.
  * `clear_color`: this is the background color of the 3D model canvas. Expects RGBa values.
  * `label`: the label that appears on the top left of the component.
* `examples`: list of 3D model files. The 3D model component can accept *.obj*, *.glb*, & *.gltf* file types.
* `cache_examples`: saves the predicted output for the examples, to save time on inference.


## Exploring mode complex Model3D Demos:

Below is a demo that uses the DPT model to predict the depth of an image and then uses 3D Point Cloud to create a 3D object. Take a look at the [app.py](https://huggingface.co/spaces/radames/dpt-depth-estimation-3d-obj/blob/main/app.py) file for a peek into the code and the model prediction function.

<iframe src="https://hf.space/embed/radames/PIFu-Clothed-Human-Digitization/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

Below is a demo that uses the DPT model to predict the depth of an image and then uses 3D Point Cloud to create a 3D object. Take a look at the [app.py](https://huggingface.co/spaces/radames/dpt-depth-estimation-3d-obj/blob/main/app.py) file for a peek into the code and the model prediction function.

<iframe src="https://hf.space/embed/radames/dpt-depth-estimation-3d-obj/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


----------

And you're done! That's all the code you need to build an interface for your Model3D model. Here are some references that you may find useful:

* Gradio's ["Getting Started" guide](https://gradio.app/getting_started/)
* The final [chatbot demo](https://huggingface.co/spaces/dawood/Model3D) and [complete code](https://huggingface.co/spaces/dawood/Model3D/tree/main) (on Hugging Face Spaces)

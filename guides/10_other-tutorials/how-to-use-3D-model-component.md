# How to Use the 3D Model Component

Related spaces: https://huggingface.co/spaces/gradio/Model3D, https://huggingface.co/spaces/gradio/PIFu-Clothed-Human-Digitization, https://huggingface.co/spaces/gradio/dpt-depth-estimation-3d-obj
Tags: VISION, IMAGE

## Introduction

3D models are becoming more popular in machine learning and make for some of the most fun demos to experiment with. Using `gradio`, you can easily build a demo of your 3D image model and share it with anyone. The Gradio 3D Model component accepts 3 file types including: _.obj_, _.glb_, & _.gltf_.

This guide will show you how to build a demo for your 3D image model in a few lines of code; like the one below. Play around with 3D object by clicking around, dragging and zooming:

<gradio-app space="gradio/Model3D"> </gradio-app>

### Prerequisites

Make sure you have the `gradio` Python package already [installed](https://gradio.app/guides/quickstart).

## Taking a Look at the Code

Let's take a look at how to create the minimal interface above. The prediction function in this case will just return the original 3D model mesh, but you can change this function to run inference on your machine learning model. We'll take a look at more complex examples below.

```python
import gradio as gr
import os


def load_mesh(mesh_file_name):
    return mesh_file_name


demo = gr.Interface(
    fn=load_mesh,
    inputs=gr.Model3D(),
    outputs=gr.Model3D(
            clear_color=[0.0, 0.0, 0.0, 0.0],  label="3D Model"),
    examples=[
        [os.path.join(os.path.dirname(__file__), "files/Bunny.obj")],
        [os.path.join(os.path.dirname(__file__), "files/Duck.glb")],
        [os.path.join(os.path.dirname(__file__), "files/Fox.gltf")],
        [os.path.join(os.path.dirname(__file__), "files/face.obj")],
    ],
)

if __name__ == "__main__":
    demo.launch()
```

Let's break down the code above:

`load_mesh`: This is our 'prediction' function and for simplicity, this function will take in the 3D model mesh and return it.

Creating the Interface:

- `fn`: the prediction function that is used when the user clicks submit. In our case this is the `load_mesh` function.
- `inputs`: create a model3D input component. The input expects an uploaded file as a {str} filepath.
- `outputs`: create a model3D output component. The output component also expects a file as a {str} filepath.
  - `clear_color`: this is the background color of the 3D model canvas. Expects RGBa values.
  - `label`: the label that appears on the top left of the component.
- `examples`: list of 3D model files. The 3D model component can accept _.obj_, _.glb_, & _.gltf_ file types.
- `cache_examples`: saves the predicted output for the examples, to save time on inference.

## Exploring a more complex Model3D Demo:

Below is a demo that uses the DPT model to predict the depth of an image and then uses 3D Point Cloud to create a 3D object. Take a look at the [app.py](https://huggingface.co/spaces/gradio/dpt-depth-estimation-3d-obj/blob/main/app.py) file for a peek into the code and the model prediction function.
<gradio-app space="gradio/dpt-depth-estimation-3d-obj"> </gradio-app>

---

And you're done! That's all the code you need to build an interface for your Model3D model. Here are some references that you may find useful:

- Gradio's ["Getting Started" guide](https://gradio.app/getting_started/)
- The first [3D Model Demo](https://huggingface.co/spaces/gradio/Model3D) and [complete code](https://huggingface.co/spaces/gradio/Model3D/tree/main) (on Hugging Face Spaces)

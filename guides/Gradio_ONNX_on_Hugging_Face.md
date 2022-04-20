
# Gradio and ONNX Model Zoo on Hugging Face 

related_spaces: https://huggingface.co/spaces/onnx/EfficientNet-Lite4
tags: ONNX

## What is ONNX Model Zoo?
Open Neural Network Exchange ([ONNX](https://onnx.ai/)) is an open standard format for representing machine learning models. ONNX is supported by a community of partners who have implemented it in many frameworks and tools.

The [ONNX Model Zoo](https://github.com/onnx/models) is a collection of pre-trained, state-of-the-art models in the ONNX format contributed by community members. Accompanying each model are Jupyter notebooks for model training and running inference with the trained model. The notebooks are written in Python and include links to the training dataset as well as references to the original paper that describes the model architecture.

## What is Hugging Face Spaces & Gradio?

### Gradio

Gradio lets users demo their machine learning models as a web app all in python code. Gradio demos can work inside jupyter notebooks, colab, embedded in your own website and hosted on Hugging Face Spaces for free.

for more info see: https://gradio.app/

### Hugging Face Spaces

Hugging Face Spaces is a free hosting option for Gradio demos on Hugging Face. Spaces comes with 3 sdks, Gradio, Streamlit and Static HTML demos. Spaces can be public or private and the workflow is similar to github repos. 

## How did Hugging Face help ONNX Model Zoo?
There are a lot of Jupyter notebooks in ONNX Model Zoo for users to test ONNX Model Zoo models. Previously users needed to download the models themselves and run those notebooks locally for testing. With Hugging Face, the testing process can be much simpler and more user-friendly. Users can easily try certain ONNX Model Zoo model on Hugging Face Spaces and run a quick demo powered by Gradio with ONNX Runtime, all on cloud without downloading anything locally. Note that there are various runtimes for ONNX, e.g., [ONNX Runtime](https://github.com/microsoft/onnxruntime), [MXNet](https://github.com/apache/incubator-mxnet). 

## What is role of ONNX Runtime?
ONNX Runtime is a cross-platform inference and training machine-learning accelerator. It makes live Gradio demo with ONNX Model Zoo model on Hugging Face possible.

ONNX Runtime inference can enable faster customer experiences and lower costs, supporting models from deep learning frameworks such as PyTorch and TensorFlow/Keras as well as classical machine learning libraries such as scikit-learn, LightGBM, XGBoost, etc. ONNX Runtime is compatible with different hardware, drivers, and operating systems, and provides optimal performance by leveraging hardware accelerators where applicable alongside graph optimizations and transforms. For more information please see the [official website](https://onnxruntime.ai/).

## Get started: How to contribute Gradio demos on HF spaces using ONNX models

* Create an account on Hugging Face: https://huggingface.co/join
* See list of models left to add to ONNX organization, please refer to the table with the [Models list](https://github.com/onnx/models#models)
* Add Gradio Demo under your username, see blog for setting up Gradio Demo on Hugging Face: https://huggingface.co/blog/gradio-spaces
* Request to join ONNX Organization: https://huggingface.co/onnx
* Once approved transfer model from your username to ONNX organization
* Add a badge for model in model table, see examples in [Models list](https://github.com/onnx/models#models)

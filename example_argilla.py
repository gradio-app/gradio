import os

from datasets import Dataset
from transformers import pipeline

import gradio as gr

os.environ["HF_AUTH_TOKEN"] = os.environ["HF_AUTH_TOKEN_PERSONAL"]

ds = Dataset.from_dict({})

pipe = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")

demo = gr.Interface.from_pipeline(pipe)
# print(demo.__dict__.keys())
# print(demo.input_components)
# print(demo.output_components)
# print(demo.fn)

def fn_new(*args):
    print(args)
    outputs = demo.fn(*args)
    print(outputs)
    print("awesome logging behavior")
    return outputs


data = {}
data["inputs"] = demo.input_components
data["outputs"] = demo.output_components
data["fn"] = fn_new
print("doing some checks to intialize a datasets or argilla dataset")


# demo.integrate()
integrated_demo = gr.Interface(**data)
integrated_demo.launch()


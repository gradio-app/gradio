import os

import argilla as rg
from datasets import Dataset
from transformers import pipeline

import gradio as gr
from gradio import components

os.environ["HF_AUTH_TOKEN"] = os.environ["HF_AUTH_TOKEN_PERSONAL"]

ds = Dataset.from_dict({})

pipe = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")

demo = gr.Interface.from_pipeline(pipe)
# print(demo.__dict__.keys())
# print(demo.input_components)
# print(demo.output_components)
# print(demo.fn)


def infer_dataset_settings(input_components, output_components):
    # TODO: skip or mape components to existing field and questions
    fields = []
    def _component_is_text(comp):
        return isinstance(comp, (components.Text, components.Textbox))
    for comp in input_components:
        if _component_is_text(comp):
            field = rg.TextField(name=comp.label)
        else:
            raise NotImplementedError
        fields.append(field)

    questions = []
    for comp in output_components:
        if _component_is_text(comp):
            question = rg.TextField(name=comp.label)
        else:
            # TODO: how to get potential labels for intializing LabelQuestion
            raise NotImplementedError
        questions.append(question)

    return rg.Settings(
        guidelines=None,
        fields=fields,
        questions=questions,
    )

data = {}
data["inputs"] = demo.input_components
data["outputs"] = demo.output_components
settings = infer_dataset_settings(
    input_components=demo.input_components,
    output_components=demo.output_components
)

dataset = rg.Dataset(
    name="test",
    workspace="test",
)

def fn_new(*args):
    print(args)
    outputs = demo.fn(*args)
    print(outputs)
    print("awesome logging behavior")
    dataset.log(records=[rg.record(args, outputs)])
    return outputs


data["fn"] = fn_new
print("doing some checks to intialize a datasets or argilla dataset")


# demo.integrate()
integrated_demo = gr.Interface(**data)
integrated_demo.launch()
integrated_demo.integrate()


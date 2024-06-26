import json
import os
import uuid
from pathlib import Path

from huggingface_hub import CommitScheduler
from transformers import pipeline

import gradio as gr

os.environ["HF_AUTH_TOKEN"] = os.environ["HF_AUTH_TOKEN_PERSONAL"]



pipe = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")

demo = gr.Interface.from_pipeline(pipe)
# print(demo.__dict__.keys())
# print(demo.input_components)
# print(demo.output_components)
# print(demo.fn)


feedback_file = Path("user_feedback/") / f"data_{uuid.uuid4()}.json"
feedback_folder = feedback_file.parent

scheduler = CommitScheduler(
    repo_id="test-datasets-integration",
    repo_type="dataset",
    folder_path=feedback_folder,
    path_in_repo="data",
    every=1,
)

def save_feedback(item):
    with scheduler.lock:
        with feedback_file.open("a") as f:
            f.write(json.dumps(item))

def fn_new(*args):
    inputs_formatted = list(args)
    if isinstance(demo.input_components, list):
        input_keys: list[str | None] = [comp.label for comp in demo.input_components]
    else:
        input_keys = [demo.input_components.label]
    outputs = demo.fn(*args)
    if isinstance(demo.output_components, list):
        output_keys = [comp.label for comp in demo.output_components]
        outputs_formatted = list(outputs)
    else:
        outputs_formatted = [outputs]
        output_keys = [demo.output_components.label]

    save_feedback(dict(zip(input_keys + output_keys,inputs_formatted + outputs_formatted)))
    return outputs

data = {}
data["inputs"] = demo.input_components
data["outputs"] = demo.output_components
data["fn"] = fn_new

# demo.integrate()
integrated_demo = gr.Interface(**data)
integrated_demo.launch()


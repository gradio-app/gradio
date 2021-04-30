import json
import requests
from gradio.interface import Interface
from gradio import inputs, outputs


def get_huggingface_interface(model_name, api_key):
    api_url = "https://api-inference.huggingface.co/models/{}".format(model_name)
    
    def query_huggingface_api(payload):
        data = json.dumps(payload)
        response = requests.request("POST", api_url, data=data)
        result = json.loads(response.content.decode("utf-8"))
        return list(result[0].values())[0]
    query_huggingface_api.__name__ = model_name
    
    return query_huggingface_api, inputs.Textbox(label="Input"), outputs.Textbox(label="Output")

def load_interface(model, src, api_key=None, verbose=True):
    assert src.lower() in repos, "parameter: src must be one of {}".format(repos.keys())
    inference_fn, inp, out = repos[src](model, api_key)
    return Interface(fn=inference_fn, inputs=inp, outputs=out)

repos = {
    # for each repo, we have a method that returns the fn, inputs, and outputs
    "huggingface": get_huggingface_interface,
    "pytorch": None,
    "tensorflow": None,
    "gradio": None,
}


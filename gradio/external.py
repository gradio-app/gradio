import json
import requests
from gradio.interface import Interface
from gradio import inputs, outputs

def get_huggingface_url(name):
    return "https://api-inference.huggingface.co/models/{}".format(name)

def get_huggingface_components(name):
    return inputs.Textbox(label="Input text:"), outputs.Textbox(label=name)

def query_huggingface(api_url, api_key, verbose):
    if api_key is None and verbose:
        print("Warning: No API key provided. You will not be able benefit from model pinning & acceleration.")
    def query_huggingface_api(payload):
        data = json.dumps(payload)
        response = requests.request("POST", api_url, data=data)
        return list(json.loads(response.content.decode("utf-8"))[0].values())[0]
    return query_huggingface_api

def load_external(model, src, api_key=None, verbose=True):
    assert src.lower() in repos, "src must be one of: {}".format(repos.keys())
    get_inference_api, query_inference_api, get_components = repos[src]
    api_url = get_inference_api(model)
    fn = query_inference_api(api_url=api_url, api_key=api_key, verbose=verbose)
    inputs, outputs = get_components(model)
    return Interface(fn=fn, inputs=inputs, outputs=outputs)

repos = {
    # for each repo, we have a tuple of methods (get_inference_api, query_inference_api, get_components)
    "huggingface": (get_huggingface_url, query_huggingface, get_huggingface_components),
    "pytorch": (None, None),
    "tensorflow": (None, None),
    "gradio": (None, None),
}


import json
import requests
from gradio import inputs, outputs


def get_huggingface_interface(model_name, api_key, alias):
    api_url = "https://api-inference.huggingface.co/models/{}".format(model_name)
    headers = {"Authorization": f"Bearer {api_key}"}

    # Checking if model exists, and if so, it gets the pipeline
    response = requests.request("GET", api_url,  headers=headers)
    assert response.status_code == 200, "Invalid model name or src"
    p = response.json().get('pipeline_tag')

    pipelines = {
        'question-answering': {
            'inputs': [inputs.Textbox(label="Context", lines=7), inputs.Textbox(label="Question")],
            'outputs': [outputs.Textbox(label="Answer"), outputs.Label(label="Score")],
            'preprocess': lambda c, q: {"inputs": {"context": c, "question": q}},
            'postprocess': lambda r: (r["answer"], r["score"]),
            # 'examples': [['My name is Sarah and I live in London', 'Where do I live?']]
        },
        'text-generation': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Output"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r[0]["generated_text"],
            # 'examples': [['My name is Clara and I am']]
        },
        'summarization': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Summary"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r[0]["summary_text"]
        },
        'translation': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Translation"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r[0]["translation_text"]
        },
        'text2text-generation': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Generated Text"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r[0]["generated_text"]
        },
        'text-classification': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Label(label="Classification"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: {'Negative': r[0][0]["score"],
                                      'Positive': r[0][1]["score"]}
        },
        'fill-mask': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': "label",
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: {i["token_str"]: i["score"] for i in r}
        },
        'zero-shot-classification': {
            'inputs': [inputs.Textbox(label="Input"),
                       inputs.Textbox(label="Possible class names ("
                                            "comma-separated)"),
                       inputs.Checkbox(label="Allow multiple true classes")],
            'outputs': "label",
            'preprocess': lambda i, c, m: {"inputs": i, "parameters":
            {"candidate_labels": c, "multi_class": m}},
            'postprocess': lambda r: {r["labels"][i]: r["scores"][i] for i in
                                      range(len(r["labels"]))}
        }
    }

    if p is None or not(p in pipelines):
        print("Warning: no interface information found")
    
    pipeline = pipelines[p]

    def query_huggingface_api(*input):
        payload = pipeline['preprocess'](*input)
        payload.update({'options': {'wait_for_model': True}})
        data = json.dumps(payload)
        response = requests.request("POST", api_url, headers=headers, data=data)
        result = json.loads(response.content.decode("utf-8"))
        output = pipeline['postprocess'](result)
        return output
    
    if alias is None:
        query_huggingface_api.__name__ = model_name
    else:
        query_huggingface_api.__name__ = alias

    interface_info = {
        'fn': query_huggingface_api, 
        'inputs': pipeline['inputs'],
        'outputs': pipeline['outputs'],
        'title': model_name,
        # 'examples': pipeline['examples'],
    }

    return interface_info

def get_gradio_interface(model_name, api_key, alias):
    api_url = "http://4553.gradiohub.com/api/predict/"  #TODO(dawood): fetch based on model name
    pipeline = {  #TODO(dawood): load from the config file
        'inputs': inputs.Textbox(label="Input"),
        'outputs': outputs.Textbox(label="Question"),
        'preprocess': lambda x: {"data": [x]},
        'postprocess': lambda r: r["data"][0],
        'examples': [['Hi, how are you?']]
    }

    def query_gradio_api(*input):
        payload = pipeline['preprocess'](*input)
        data = json.dumps(payload)
        response = requests.request("POST", api_url, data=data)
        result = json.loads(response.content.decode("utf-8"))
        output = pipeline['postprocess'](result)
        return output

    query_gradio_api.__name__ = model_name

    interface_info = {
        'fn': query_gradio_api, 
        'inputs': pipeline['inputs'],
        'outputs': pipeline['outputs'],
        'title': model_name,
        # 'examples': pipeline['examples'],
    }

    return interface_info

def load_interface(name, src=None, api_key=None, alias=None):
    if src is None:
        tokens = name.split("/")
        assert len(tokens) > 1, "Either `src` parameter must be provided, or `name` must be formatted as \{src\}/\{repo name\}"
        src = tokens[0]
        name = "/".join(tokens[1:])
    assert src.lower() in repos, "parameter: src must be one of {}".format(repos.keys())
    interface_info = repos[src](name, api_key, alias)
    return interface_info

repos = {
    # for each repo, we have a method that returns the Interface given the model name & optionally an api_key
    "huggingface": get_huggingface_interface,
    "gradio": get_gradio_interface,
}


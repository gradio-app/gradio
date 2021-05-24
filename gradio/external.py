import json
import requests
from gradio import inputs, outputs


def get_huggingface_interface(model_name, api_key, alias):
    api_url = "https://api-inference.huggingface.co/models/{}".format(model_name)
    if api_key is not None:
        headers = {"Authorization": f"Bearer {api_key}"}
    else:
        headers = {}

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
        },
        'automatic-speech-recognition': {
            'inputs': inputs.Audio(label="Input", source="upload",
                                   type="file"),
            'outputs': outputs.Textbox(label="Output"),
            'preprocess': lambda i: {"inputs": i},
            'postprocess': lambda r: r["text"]
        },
        'image-classification': {
            'inputs': inputs.Image(label="Input Image", type="file"),
            'outputs': outputs.Label(label="Classification"),
            'preprocess': lambda i: i,
            'postprocess': lambda r: {i["label"].split(", ")[0]: i["score"] for
                                      i in r}
        }
    }

    if p is None or not(p in pipelines):
        print("Warning: no interface information found")
    
    pipeline = pipelines[p]

    def query_huggingface_api(*input):
        payload = pipeline['preprocess'](*input)
        if p == 'automatic-speech-recognition' or p == 'image-classification':
            with open(input[0].name, "rb") as f:
                data = f.read()
        else:
            payload.update({'options': {'wait_for_model': True}})
            data = json.dumps(payload)
        response = requests.request("POST", api_url, headers=headers, data=data)
        if response.status_code == 200:
            result = json.loads(response.content.decode("utf-8"))
            output = pipeline['postprocess'](result)
        else:
            raise ValueError("Could not complete request to HuggingFace API, Error {}".format(response.status_code))
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
    model_info = requests.get("https://gradio.app/get_config/{}".format(model_name)).json()
    config_info = json.loads(model_info["config"])
    api_url = "{}/api/predict/".format(model_info["url"])

    headers = {
        'authority': model_info["url"],
        'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="90", "Microsoft Edge";v="90"',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'sec-ch-ua-mobile': '?1',
        'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Mobile Safari/537.36 Edg/90.0.818.56',
        'content-type': 'application/json; charset=UTF-8',
        'origin': 'https://gradio.app',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://gradio.app/',
        'accept-language': 'en-US,en;q=0.9',
    }

    def query_gradio_api(*input):
        payload = pipeline['preprocess'](*input)
        data = json.dumps(payload)
        response = requests.post(api_url, headers=headers, data=data)
        result = json.loads(response.content.decode("utf-8"))
        output = pipeline['postprocess'](result)
        return output

    if alias is None:
        query_gradio_api.__name__ = model_name
    else:
        query_gradio_api.__name__ = alias

    pipeline = {
        'inputs': [inp[0] for inp in config_info["input_components"]],
        'outputs': [out[0] for out in config_info["output_components"]],
        'preprocess': lambda x: {"data": [x]},
        'postprocess': lambda r: r["data"][0],
    }

    interface_info = {
        'fn': query_gradio_api, 
        'inputs': pipeline['inputs'],
        'outputs': pipeline['outputs'],
        'title': model_name,
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


import json
import tempfile
import requests
from gradio import inputs, outputs
import re
import base64


def get_huggingface_interface(model_name, api_key, alias):
    model_url = "https://huggingface.co/{}".format(model_name)
    api_url = "https://api-inference.huggingface.co/models/{}".format(model_name)
    print("Fetching model from: {}".format(model_url))

    if api_key is not None:
        headers = {"Authorization": f"Bearer {api_key}"}
    else:
        headers = {}

    # Checking if model exists, and if so, it gets the pipeline
    response = requests.request("GET", api_url,  headers=headers)
    assert response.status_code == 200, "Invalid model name or src"
    p = response.json().get('pipeline_tag')

    # convert from binary to base64
    def post_process_binary_body(r: requests.Response):
        with tempfile.NamedTemporaryFile(delete=False) as fp:
            fp.write(r.content)
            return fp.name

    pipelines = {
        'question-answering': {
            'inputs': [inputs.Textbox(label="Context", lines=7), inputs.Textbox(label="Question")],
            'outputs': [outputs.Textbox(label="Answer"), outputs.Label(label="Score")],
            'preprocess': lambda c, q: {"inputs": {"context": c, "question": q}},
            'postprocess': lambda r: (r.json()["answer"], r.json()["score"]),
            # 'examples': [['My name is Sarah and I live in London', 'Where do I live?']]
        },
        'text-generation': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Output"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r.json()[0]["generated_text"],
            # 'examples': [['My name is Clara and I am']]
        },
        'summarization': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Summary"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r.json()[0]["summary_text"]
        },
        'translation': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Translation"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r.json()[0]["translation_text"]
        },
        'text2text-generation': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Textbox(label="Generated Text"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r.json()[0]["generated_text"]
        },
        'text-classification': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Label(label="Classification", type="confidences"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: {'Negative': r.json()[0][0]["score"],
                                      'Positive': r.json()[0][1]["score"]}
        },
        'fill-mask': {
            'inputs': inputs.Textbox(label="Input"),
            'outputs': "label",
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: {i["token_str"]: i["score"] for i in r.json()}
        },
        'zero-shot-classification': {
            'inputs': [inputs.Textbox(label="Input"),
                       inputs.Textbox(label="Possible class names ("
                                            "comma-separated)"),
                       inputs.Checkbox(label="Allow multiple true classes")],
            'outputs': outputs.Label(label="Classification", type="confidences"),
            'preprocess': lambda i, c, m: {"inputs": i, "parameters":
            {"candidate_labels": c, "multi_class": m}},
            'postprocess': lambda r: {r.json()["labels"][i]: r.json()["scores"][i] for i in
                                      range(len(r.json()["labels"]))}
        },
        'automatic-speech-recognition': {
            'inputs': inputs.Audio(label="Input", source="upload",
                                   type="filepath"),
            'outputs': outputs.Textbox(label="Output"),
            'preprocess': lambda i: {"inputs": i},
            'postprocess': lambda r: r.json()["text"]
        },
        'image-classification': {
            'inputs': inputs.Image(label="Input Image", type="filepath"),
            'outputs': outputs.Label(label="Classification", type="confidences"),
            'preprocess': lambda i: base64.b64decode(i.split(",")[1]),  # convert the base64 representation to binary
            'postprocess': lambda r: {i["label"].split(", ")[0]: i["score"] for i in r.json()}
        },
        'feature-extraction': {
            # example model: hf.co/julien-c/distilbert-feature-extraction
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Dataframe(label="Output"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda r: r.json()[0],
        },
        'sentence-similarity': {
            # example model: hf.co/sentence-transformers/distilbert-base-nli-stsb-mean-tokens
            'inputs': [
                inputs.Textbox(label="Source Sentence", default="That is a happy person"),
                inputs.Textbox(lines=7, label="Sentences to compare to", placeholder="Separate each sentence by a newline"),
            ],
            'outputs': outputs.Label(label="Classification", type="confidences"),
            'preprocess': lambda src, sentences: {"inputs": {
                "source_sentence": src,
                "sentences": [s for s in sentences.splitlines() if s != ""],
            }},
            'postprocess': lambda r: { f"sentence {i}": v for i, v in enumerate(r.json()) },
        },
        'text-to-speech': {
            # example model: hf.co/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Audio(label="Audio"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda x: base64.b64encode(x.content).decode('utf-8'),
        },
        'text-to-image': {
            # example model: hf.co/osanseviero/BigGAN-deep-128
            'inputs': inputs.Textbox(label="Input"),
            'outputs': outputs.Image(label="Output"),
            'preprocess': lambda x: {"inputs": x},
            'postprocess': lambda x: base64.b64encode(x.content).decode('utf-8'),
        },
    }

    if p is None or not(p in pipelines):
        print("Warning: no interface information found")
    
    pipeline = pipelines[p]

    def query_huggingface_api(*params):
        # Convert to a list of input components
        data = pipeline['preprocess'](*params)
        if isinstance(data, dict):  # HF doesn't allow additional parameters for binary files (e.g. images or audio files)
            data.update({'options': {'wait_for_model': True}})
            data = json.dumps(data)
        response = requests.request("POST", api_url, headers=headers, data=data)        
        if not(response.status_code == 200):
            raise ValueError("Could not complete request to HuggingFace API, Error {}".format(response.status_code))
        output = pipeline['postprocess'](response)
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
        'api_mode': True,
    }

    return interface_info

def load_interface(name, src=None, api_key=None, alias=None):
    if src is None:
        tokens = name.split("/")  # Separate the source (e.g. "huggingface") from the repo name (e.g. "google/vit-base-patch16-224")
        assert len(tokens) > 1, "Either `src` parameter must be provided, or `name` must be formatted as \{src\}/\{repo name\}"
        src = tokens[0]
        name = "/".join(tokens[1:])
    assert src.lower() in repos, "parameter: src must be one of {}".format(repos.keys())
    interface_info = repos[src](name, api_key, alias)
    return interface_info

def interface_params_from_config(config_dict):
    ## instantiate input component and output component
    config_dict["inputs"] = [inputs.get_input_instance(component) for component in config_dict["input_components"]]
    config_dict["outputs"] = [outputs.get_output_instance(component) for component in config_dict["output_components"]]
    parameters = {
        "allow_flagging", "allow_screenshot", "article", "description", "flagging_options", "inputs", "outputs",
        "show_input", "show_output", "theme", "title"
    }
    config_dict = {k: config_dict[k] for k in parameters}
    return config_dict

def get_spaces_interface(model_name, api_key, alias):
    space_url = "https://huggingface.co/spaces/{}".format(model_name)
    print("Fetching interface from: {}".format(space_url))
    iframe_url = "https://huggingface.co/gradioiframe/{}/+".format(model_name)
    api_url = "https://huggingface.co/gradioiframe/{}/api/predict/".format(model_name)
    headers = {'Content-Type': 'application/json'}

    r = requests.get(iframe_url)
    result = re.search('window.config =(.*?);\n', r.text) # some basic regex to extract the config
    config = json.loads(result.group(1))
    interface_info = interface_params_from_config(config)
    
    # The function should call the API with preprocessed data
    def fn(*data):
        data = json.dumps({"data": data})
        response = requests.post(api_url, headers=headers, data=data)
        result = json.loads(response.content.decode("utf-8"))
        output = result["data"]
        if len(interface_info["outputs"])==1:  # if the fn is supposed to return a single value, pop it
            output = output[0]
        if len(interface_info["outputs"])==1 and isinstance(output, list):  # Needed to support Output.Image() returning bounding boxes as well (TODO: handle different versions of gradio since they have slightly different APIs)
            output = output[0]
        return output
     
    fn.__name__ = alias if (alias is not None) else model_name
    interface_info["fn"] = fn
    interface_info["api_mode"] = True
    
    return interface_info

repos = {
    # for each repo, we have a method that returns the Interface given the model name & optionally an api_key
    "huggingface": get_huggingface_interface,
    "models": get_huggingface_interface,
    "spaces": get_spaces_interface,
}


import json
from gradio.inputs import AbstractInput
from gradio.outputs import AbstractOutput
from gradio.interface import Interface
import inspect

def get_params(func):
    params_str = inspect.getdoc(func)
    params_doc = []
    documented_params = {"self"}
    for param_line in params_str.split("\n")[1:]:
        space_index = param_line.index(" ")
        colon_index = param_line.index(":")
        name = param_line[:space_index]
        documented_params.add(name)
        params_doc.append((name, param_line[space_index+2:colon_index-1], param_line[colon_index+2:]))
    params = inspect.getfullargspec(func)
    param_set = []
    for i in range(len(params.args)):
        neg_index = -1 - i
        if params.args[neg_index] not in documented_params:
            continue
        if i < len(params.defaults):
            default = params.defaults[neg_index]
            if type(default) == str:
                default = '"' + default + '"'
            else:
                default = str(default)
            param_set.insert(0, (params.args[neg_index], default))
        else:
            param_set.insert(0, (params.args[neg_index],))
    return param_set, params_doc

def document(cls_set):
    docset = []
    for cls in cls_set:
        inp = {}
        inp["name"] = cls.__name__
        doc = inspect.getdoc(cls)
        inp["doc"] = "\n".join(doc.split("\n")[:-1])
        inp["type"] = doc.split("\n")[-1].split("type: ")[-1]
        inp["params"], inp["params_doc"] = get_params(cls.__init__)
        inp["shortcuts"] = list(cls.get_shortcut_implementations().items())
        docset.append(inp)
    return docset

inputs = document(AbstractInput.__subclasses__())
outputs = document(AbstractOutput.__subclasses__())
interface_params = get_params(Interface.__init__)
interface = {
    "doc": inspect.getdoc(Interface),
    "params": interface_params[0],
    "params_doc": interface_params[1],
}
launch_params = get_params(Interface.launch)
launch = {
    "params": launch_params[0],
    "params_doc": launch_params[1],
}

with open("docs.json", "w") as docs:
    json.dump({
        "inputs": inputs,
        "outputs": outputs,
        "interface": interface,        
        "launch": launch
    }, docs)


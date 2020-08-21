import json
from gradio.inputs import InputComponent
from gradio.outputs import OutputComponent
from gradio.interface import Interface
import inspect
from os import listdir
from os.path import join
import re

in_demos, out_demos = {}, {}
demo_regex = "# Demo: \((.*)\) -> \((.*)\)"
for demo in listdir("demo"):
    if demo.endswith(".py"):
        screenshots = listdir(join("demo/screenshots", demo[:-3]))
        demoset = [demo, screenshots]
        with open(join("demo", demo)) as demo_file:
            first_line = demo_file.readline()
            match = re.match(demo_regex, first_line)
            inputs = match.group(1).split(", ")
            outputs = match.group(2).split(", ")
            for i in inputs:
                if i not in in_demos:
                    in_demos[i] = []
                elif demoset not in in_demos[i]:
                    in_demos[i].append(demoset)
            for o in outputs:
                if o not in out_demos:
                    out_demos[o] = []
                elif demoset not in out_demos[o]:
                    out_demos[o].append(demoset)

def get_params(func):
    params_str = inspect.getdoc(func)
    params_doc = []
    documented_params = {"self"}
    for param_line in params_str.split("\n")[1:]:
        if param_line.strip() == "Returns":
            break
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

def document(cls_set, demos):
    docset = []
    for cls in cls_set:
        inp = {}
        inp["name"] = cls.__name__
        doc = inspect.getdoc(cls)
        if doc.startswith("DEPRECATED"):
            continue
        inp["doc"] = "\n".join(doc.split("\n")[:-1])
        inp["type"] = doc.split("\n")[-1].split("type: ")[-1]
        inp["params"], inp["params_doc"] = get_params(cls.__init__)
        inp["shortcuts"] = list(cls.get_shortcut_implementations().items())
        cls_name = cls.__name__
        if cls_name in demos:
            inp["demos"] = demos.get(cls_name, [])
        docset.append(inp)
    return docset

inputs = document(InputComponent.__subclasses__(), in_demos)
outputs = document(OutputComponent.__subclasses__(), out_demos)
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
        "launch": launch,
    }, docs)


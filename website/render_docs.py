from gradio.inputs import InputComponent
from gradio.outputs import OutputComponent
from gradio.interface import Interface
import inspect
import os
from jinja2 import Template

GRADIO_DIR = os.path.join(os.pardir, "gradio")
 
def get_ins_and_outs(func):
    doc_str = inspect.getdoc(func)
    func_doc, params_doc, return_doc = [], [], []
    documented_params = {"self"}
    mode = "pre"
    for line in doc_str.split("\n"):
        if line.startswith("Parameters:"):
            mode = "in"
            continue
        if line.startswith("Returns:"):
            mode = "out"
            continue
        if "DEPRECATED" in line:
            continue
        if mode == "pre":
            func_doc.append(line)            
        elif mode == "in":
            space_index = line.index(" ")
            colon_index = line.index(":")
            name = line[:space_index]
            documented_params.add(name)
            params_doc.append((name, line[space_index+2:colon_index-1], line[colon_index+2:]))
        elif mode == "out":
            colon_index = line.index(":")
            return_doc.append((line[1:colon_index-1], line[colon_index+2:]))
    params = inspect.getfullargspec(func)
    param_set = []
    for i in range(len(params.args)):
        neg_index = -1 - i
        if params.args[neg_index] not in documented_params:
            continue
        if params.defaults and i < len(params.defaults):
            default = params.defaults[neg_index]
            if type(default) == str:
                default = '"' + default + '"'
            else:
                default = str(default)
            param_set.insert(0, (params.args[neg_index], default))
        else:
            param_set.insert(0, (params.args[neg_index],))
    return "\n".join(func_doc), param_set, params_doc, return_doc

def document(cls_set):
    docset = []
    for cls in cls_set:
        inp = {}
        inp["name"] = cls.__name__
        doc = inspect.getdoc(cls)
        if doc.startswith("DEPRECATED"):
            continue
        doc_lines = doc.split("\n")        
        inp["doc"] = "\n".join(doc_lines[:-2])
        inp["type"] = doc_lines[-2].split("type: ")[-1]
        inp["demos"] = doc_lines[-1][7:].split(", ")
        _, inp["params"], inp["params_doc"], _ = get_ins_and_outs(cls.__init__)
        inp["shortcuts"] = list(cls.get_shortcut_implementations().items())
        if "interpret" in cls.__dict__:
            inp["interpret"], inp["interpret_params"], inp["interpret_params_doc"], _ = get_ins_and_outs(cls.interpret)
            _, _, _, inp["interpret_returns_doc"] = get_ins_and_outs(cls.get_interpretation_scores)

        docset.append(inp)
    return docset

def generate():
    inputs = document(InputComponent.__subclasses__())
    outputs = document(OutputComponent.__subclasses__())
    interface_params = get_ins_and_outs(Interface.__init__)
    interface = {
        "doc": inspect.getdoc(Interface),
        "params": interface_params[1],
        "params_doc": interface_params[2],
    }
    launch_params = get_ins_and_outs(Interface.launch)
    launch = {
        "params": launch_params[1],
        "params_doc": launch_params[2],
    }
    load_params = get_ins_and_outs(Interface.load)
    load = {
        "params": load_params[1],
        "params_doc": load_params[2],
        "return_doc": load_params[3],
    }
    docs = {
        "inputs": inputs,
        "outputs": outputs,
        "interface": interface,        
        "launch": launch,
        "load": load,
    }
    os.makedirs("generated", exist_ok=True)
    with open("src/docs_template.html") as template_file:
        template = Template(template_file.read())
        output_html = template.render(docs=docs)
    os.makedirs(os.path.join("generated", "docs"), exist_ok=True)
    with open(os.path.join("generated", "docs", "index.html"), "w") as generated_template:
        generated_template.write(output_html)

if __name__ == "__main__":
    generate()

import os
import sys
import json
from jinja2 import Template
import requests
import markdown2
import re
from gradio.inputs import InputComponent
from gradio.outputs import OutputComponent
from gradio.interface import Interface
import inspect
import shutil

GRADIO_DIR = "../../"
GRADIO_GUIDES_DIR = os.path.join(GRADIO_DIR, "guides")
GRADIO_DEMO_DIR = os.path.join(GRADIO_DIR, "demo")

guide_names = [] # used for dropdown in navbar
for guide in sorted(os.listdir(GRADIO_GUIDES_DIR)):
    if "template" in guide:
        continue
    guide_name = guide[:-3]
    pretty_guide_name = " ".join([word.capitalize().replace("Ml", "ML")
        for word in guide_name.split("_")])
    guide_names.append((guide_name, pretty_guide_name))

def render_index():
    os.makedirs("generated", exist_ok=True)
    with open("src/tweets.json", encoding='utf-8') as tweets_file:
        tweets = json.load(tweets_file)
    star_count = "{:,}".format(requests.get("https://api.github.com/repos/gradio-app/gradio"
        ).json()["stargazers_count"])
    with open("src/index_template.html", encoding='utf-8') as template_file:
        template = Template(template_file.read())
        output_html = template.render(tweets=tweets, star_count=star_count, guide_names=guide_names)
    with open(os.path.join("generated", "index.html"), "w", encoding='utf-8') as generated_template:
        generated_template.write(output_html)

def render_guides():
    guides = []
    for guide in os.listdir(GRADIO_GUIDES_DIR):
        if "template" in guide:
            continue
        with open(os.path.join(GRADIO_GUIDES_DIR, guide), encoding='utf-8') as guide_file:
            guide_text = guide_file.read()
        code_tags = re.findall(r'\{\{ code\["([^\s]*)"\] \}\}', guide_text)
        demo_names = re.findall(r'\{\{ demos\["([^\s]*)"\] \}\}', guide_text)
        code, demos = {}, {}
        guide_text = guide_text.replace(
            "website/src/assets", "/assets").replace(
            "```python\n", "<pre><code class='lang-python'>").replace(
            "```bash\n", "<pre><code class='lang-bash'>").replace(
            "```directory\n", "<pre><code class='lang-bash'>").replace(
            "```csv\n", "<pre><code class='lang-bash'>").replace(
            "```", "</code></pre>")
        for code_src in code_tags:
            with open(os.path.join(GRADIO_DEMO_DIR, code_src, "run.py")) as code_file:
                python_code = code_file.read().replace(
                    'if __name__ == "__main__":\n    iface.launch()', "iface.launch()")
                code[code_src] = "<pre><code class='lang-python'>" + \
                    python_code + "</code></pre>"
        for demo_name in demo_names:
            demos[demo_name] = "<div id='interface_" + demo_name + "'></div>"
        guide_template = Template(guide_text)
        guide_output = guide_template.render(code=code, demos=demos)
        output_html = markdown2.markdown(guide_output)
        output_html = output_html.replace("<a ", "<a target='blank' ")
        for match in re.findall(r'<h3>([A-Za-z0-9 ]*)<\/h3>', output_html):
            output_html = output_html.replace(
                f"<h3>{match}</h3>", f"<h3 id={match.lower().replace(' ', '_')}>{match}</h3>")
        os.makedirs("generated", exist_ok=True)
        guide = guide[:-3]
        os.makedirs(os.path.join(
            "generated", guide), exist_ok=True)
        with open("src/guides_template.html", encoding='utf-8') as general_template_file:
            general_template = Template(general_template_file.read())
        with open(os.path.join("generated", guide, "index.html"), "w", encoding='utf-8') as generated_template:
            output_html = general_template.render(template_html=output_html, demo_names=demo_names, guide_names=guide_names)
            generated_template.write(output_html)

def render_docs():
    if os.path.exists("generated/colab_links.json"):
        with open("generated/colab_links.json") as demo_links_file:
            demo_links = json.load(demo_links_file)
    else:  # docs will be missing demo links
        demo_links = {}
    SCREENSHOT_FOLDER = "dist/assets/demo_screenshots"
    os.makedirs(SCREENSHOT_FOLDER, exist_ok=True)

    def get_function_documentation(func):
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
                params_doc.append(
                    (name, line[space_index+2:colon_index-1], line[colon_index+2:]))
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

    def get_class_documentation(cls):
        inp = {}
        inp["name"] = cls.__name__
        doc = inspect.getdoc(cls)
        doc_lines = doc.split("\n")
        inp["doc"] = "\n".join(doc_lines[:-2])
        inp["type"] = doc_lines[-2].split("type: ")[-1]
        inp["demos"] = doc_lines[-1][7:].split(", ")
        _, inp["params"], inp["params_doc"], _ = get_function_documentation(cls.__init__)
        inp["shortcuts"] = list(cls.get_shortcut_implementations().items())
        if "interpret" in cls.__dict__:
            inp["interpret"], inp["interpret_params"], inp["interpret_params_doc"], _ = get_function_documentation(
                cls.interpret)
            _, _, _, inp["interpret_returns_doc"] = get_function_documentation(
                cls.get_interpretation_scores)

        return inp

    inputs = [get_class_documentation(cls) for cls in InputComponent.__subclasses__()]
    outputs = [get_class_documentation(cls) for cls in OutputComponent.__subclasses__()]
    interface_params = get_function_documentation(Interface.__init__)
    interface = {
        "doc": inspect.getdoc(Interface),
        "params": interface_params[1],
        "params_doc": interface_params[2],
    }
    launch_params = get_function_documentation(Interface.launch)
    launch = {
        "params": launch_params[1],
        "params_doc": launch_params[2],
    }
    load_params = get_function_documentation(Interface.load)
    load = {
        "params": load_params[1],
        "params_doc": load_params[2],
        "return_doc": load_params[3],
    }
    docs = {
        "input": inputs,
        "output": outputs,
        "interface": interface,
        "launch": launch,
        "load": load,
    }
    os.makedirs("generated", exist_ok=True)
    with open("src/docs_template.html") as template_file:
        template = Template(template_file.read())
        output_html = template.render(docs=docs, demo_links=demo_links, guide_names=guide_names)
    os.makedirs(os.path.join("generated", "docs"), exist_ok=True)
    with open(os.path.join("generated", "docs", "index.html"), "w") as generated_template:
        generated_template.write(output_html)

if __name__ == "__main__":
    render_index()
    render_guides()
    render_docs()

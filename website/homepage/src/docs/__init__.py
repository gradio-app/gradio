import os
import re

from gradio_client.documentation import document_cls, generate_documentation
from gradio.events import EventListener
import markdown2


from ..guides import guides

DIR = os.path.dirname(__file__)
GRADIO_DIR = "../../"
TEMPLATE_FILE = os.path.join(DIR, "template.html")
TEMP_TEMPLATE = os.path.join(DIR, "temporary_template.html")
DEMOS_DIR = os.path.join(GRADIO_DIR, "demo")
JS_CLIENT_README = os.path.join(GRADIO_DIR, "client", "js", "README.md")

docs = generate_documentation()
docs["component"].sort(key=lambda x: x["name"])


def add_component_shortcuts():
    for component in docs["component"]:
        if not getattr(component["class"], "allow_string_shortcut", True):
            continue
        component["string_shortcuts"] = [
            (
                component["class"].__name__,
                component["name"].lower(),
                "Uses default values",
            )
        ]
        for subcls in component["class"].__subclasses__():
            if getattr(subcls, "is_template", False):
                _, tags, _ = document_cls(subcls)
                component["string_shortcuts"].append(
                    (
                        subcls.__name__,
                        subcls.__name__.lower(),
                        "Uses " + tags.get("sets", "default values"),
                    )
                )


add_component_shortcuts()


def add_demos():
    for mode in docs:
        for cls in docs[mode]:
            if "demos" not in cls["tags"]:
                continue
            cls["demos"] = []
            demos = [demo.strip() for demo in cls["tags"]["demos"].split(",")]
            for demo in demos:
                demo_file = os.path.join(DEMOS_DIR, demo, "run.py")
                with open(demo_file) as run_py:
                    demo_code = run_py.read()
                cls["demos"].append((demo, demo_code))


add_demos()

ordered_events = ["Change()", "Click()", "Submit()", "Edit()", "Clear()", "Play()", "Pause()", "Stream()", "Blur()", "Upload()"]

def add_supported_events():
    for component in docs["component"]:
        component["events-list"] = []
        event_listener_props = dir(EventListener)
        for listener in EventListener.__subclasses__():
            if not issubclass(component["class"], listener):
                continue
            for prop in dir(listener):
                if prop not in event_listener_props:
                    component["events-list"].append(prop + "()")
        if component["events-list"]:
            component["events"] = ", ".join(component["events-list"])


add_supported_events()


def add_guides():
    for mode in docs:
        for cls in docs[mode]:
            if "guides" not in cls["tags"]:
                continue
            cls["guides"] = []
            docstring_guides = [
                guide.strip() for guide in cls["tags"]["guides"].split(",")
            ]
            for docstring_guide in docstring_guides:
                for guide in guides:
                    if docstring_guide == guide["name"]:
                        cls["guides"].append(guide)


add_guides()


def style_types():
    for mode in docs:
        for cls in docs[mode]:
            for tag in [
                "preprocessing",
                "postprocessing",
                "examples-format",
                "events",
            ]:
                if tag not in cls["tags"]:
                    continue
                cls["tags"][tag] = (
                    cls["tags"][tag]
                    .replace(
                        "{",
                        "<span class='text-orange-500' style='font-family: monospace; font-size: large;' >",
                    )
                    .replace("}", "</span>")
                )


style_types()


def override_signature(name, signature):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == name:
                cls["override_signature"] = signature


override_signature("Blocks", "with gr.Blocks():")
override_signature("Row", "with gr.Row():")
override_signature("Column", "with gr.Column():")
override_signature("Tab", "with gr.Tab():")
override_signature("Group", "with gr.Group():")
override_signature("Box", "with gr.Box():")
override_signature("Dataset", "gr.Dataset(components, samples)")


def find_cls(target_cls):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == target_cls:
                return cls
    raise ValueError("Class not found")


def build_js_client():
        with open(JS_CLIENT_README, "r") as f:
            js_docs = f.read()
        js_docs = re.sub(
            r"```([a-z]+)\n",
            lambda x: f"<div class='codeblock'><pre><code class='lang-{x.group(1)}'>",
            js_docs,
        )
        js_docs = re.sub(r"```", "</code></pre></div>", js_docs)
        with open(TEMP_TEMPLATE, "w") as temp_html:
                temp_html.write(
                    markdown2.markdown(
                        js_docs,
                        extras=[
                            "target-blank-links",
                            "header-ids",
                            "tables",
                            "fenced-code-blocks",
                        ],
                    )
                )
        


def build(output_dir, jinja_env, gradio_wheel_url, gradio_version):
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("docs/template.html")
    build_js_client()
    output = template.render(
        docs=docs,
        ordered_events=ordered_events,
        find_cls=find_cls,
        version="main",
        gradio_version=gradio_version,
        gradio_wheel_url=gradio_wheel_url,
        canonical_suffix="/main"
    )
    output_folder = os.path.join(output_dir, "docs")
    os.makedirs(output_folder)
    output_main = os.path.join(output_folder, "main")
    os.makedirs(output_main)
    output_file = os.path.join(output_main, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)
    template = jinja_env.get_template(f"docs/v{gradio_version}_template.html")
    output = template.render()
    version_docs_file = os.path.join(output_folder, "index.html")
    with open(version_docs_file, "w") as index_html:
        index_html.write(output)


def build_pip_template(version, jinja_env):
    build_js_client()
    template = jinja_env.get_template("docs/template.html")
    output = template.render(
        docs=docs, find_cls=find_cls, version="pip", gradio_version=version, canonical_suffix="", ordered_events=ordered_events
    )
    with open(f"src/docs/v{version}_template.html", "w+") as template_file:
        template_file.write(output)

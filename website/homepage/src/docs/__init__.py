import os
from gradio.documentation import generate_documentation, document_cls
import gradio.templates

DIR = os.path.dirname(__file__)
GRADIO_DIR = "../../"
TEMPLATE_FILE = os.path.join(DIR, "template.html")
DEMOS_DIR = os.path.join(GRADIO_DIR, "demo")

docs = generate_documentation()
def add_component_shortcuts():
    for component in docs["component"]:
        if not getattr(component["class"], "allow_string_shortcut", True):
            continue
        component["string_shortcuts"] = [
            (component["name"].lower(), "Uses default values")
        ]
        for subcls in component["class"].__subclasses__():
            if getattr(subcls, "is_template", False):
                _, tags, _ = document_cls(subcls)
                component["string_shortcuts"].append(
                    (subcls.__name__.lower(), "Uses " + tags.get("sets", "default values"))
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

def override_signature(name, signature):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == name:
                cls["override_signature"] = signature

override_signature("Blocks", "with gradio.Blocks(theme, analytics_enabled, mode):")
override_signature("Row", "with gradio.Row():")
override_signature("Column", "with gradio.Column():")
override_signature("Tabs", "with gradio.Tabs():")
override_signature("Group", "with gradio.Group():")
override_signature("Box", "with gradio.Box():")


def find_cls(target_cls):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == target_cls:
                return cls
    raise ValueError("Class not found")

def build(output_dir, jinja_env):
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("docs/template.html")
    output = template.render(docs=docs, find_cls=find_cls)
    output_folder = os.path.join(output_dir, "docs")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)

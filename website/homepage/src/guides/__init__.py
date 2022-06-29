import os
import markdown2
import shutil
import re

DIR = os.path.dirname(__file__)
TEMPLATE_FILE = os.path.join(DIR, "template.html")

GRADIO_DIR = "../../"
GUIDES_DIR = os.path.join(GRADIO_DIR, "guides")
GUIDE_ASSETS_DIR = os.path.join(GUIDES_DIR, "assets", "guides")
DEMOS_DIR = os.path.join(GRADIO_DIR, "demo")

TEMP_TEMPLATE = os.path.join(DIR, "temporary_template.html")

demos = {}
for demo_folder in os.listdir(DEMOS_DIR):
    runfile = os.path.join(DEMOS_DIR, demo_folder, "run.py")
    if not os.path.exists(runfile):
        continue
    with open(runfile) as run_py:
        demos[demo_folder] = run_py.read().replace(
            'if __name__ == "__main__":\n    demo.launch()', "demo.launch()"
        )

guide_list = os.listdir(GUIDES_DIR)
guide_list.remove("CONTRIBUTING.md")
guide_list.remove("assets")

guides = []
for guide in guide_list:
    guide_name = guide[:-3]
    if guide_name == "getting_started":
        pretty_guide_name = "Quickstart"
    else:
        pretty_guide_name = " ".join(
            [word.capitalize() for word in guide_name.split("_")]
        )
    with open(os.path.join(GUIDES_DIR, guide), "r") as f:
        guide_content = f.read()

    title = guide_content.split("\n")[0]

    def get_labeled_metadata(label, is_list=True):
        full_label = label + " "
        metadata = [] if is_list else None
        if full_label in guide_content:
            metadata = guide_content.split(full_label)[1].split("\n")[0]
            if is_list:
                metadata = metadata.split(", ")
        return metadata

    tags = get_labeled_metadata("Tags:")
    spaces = get_labeled_metadata("Related spaces:")
    contributor = get_labeled_metadata("Contributed by", is_list=False)
    docs = get_labeled_metadata("Docs:")

    url = f"https://gradio.app/{guide_name}/"

    guide_content = "\n".join(
        [
            line
            for i, line in enumerate(guide_content.split("\n"))
            if not (
                line.startswith("Tags: ")
                or line.startswith("Related spaces: ")
                or line.startswith("Contributed by ")
                or line.startswith("Docs: ")
            )
        ]
    )
    guide_content = re.sub(r"```([a-z]+)\n", lambda x: f"<pre><code class='lang-{x.group(1)}'>", guide_content)
    guide_content = re.sub(r"```", "</code></pre>", guide_content)
    guide_content = re.sub(
        r"\$code_([a-z _\-0-9]+)", 
        lambda x: f"<pre><code class='lang-python'>{demos[x.group(1)]}</code></pre>", 
        guide_content
    )
    guide_content = re.sub(
        r"\$demo_([a-z _\-0-9]+)", 
        lambda x: f"<gradio-app src='/demo/{x.group(1)}' />", 
        guide_content
    )

    guides.append(
        {
            "name": guide_name,
            "pretty_name": pretty_guide_name,
            "content": guide_content,
            "tags": tags,
            "spaces": spaces,
            "url": url,
            "contributor": contributor,
            "docs": docs,
        }
    )

def build_guides(output_dir, jinja_env):
    shutil.copytree(GUIDE_ASSETS_DIR, os.path.join(output_dir, "assets", "guides"))
    for guide in guides:
        with open(TEMP_TEMPLATE, "w") as temp_html:
            temp_html.write(
                markdown2.markdown(
                    guide["content"],
                    extras=["target-blank-links", "header-ids", "tables", "fenced-code-blocks"],
                )
            )
        template = jinja_env.get_template("guides/template.html")
        output_folder = os.path.join(output_dir, guide["name"])
        os.makedirs(output_folder)
        output_file = os.path.join(output_folder, "index.html")
        output = template.render(code={}, demos={})
        with open(output_file, "w") as index_html:
            index_html.write(output)

def build_gallery(output_dir, jinja_env):
    template = jinja_env.get_template("guides/gallery_template.html")
    output = template.render(guides=guides)
    output_folder = os.path.join(output_dir, "guides")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)

def build(output_dir, jinja_env):
    build_guides(output_dir, jinja_env)
    build_gallery(output_dir, jinja_env)

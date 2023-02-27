import os
import markdown2
import shutil
import re
import json

DIR = os.path.dirname(__file__)

GRADIO_DIR = "../../../../"
GUIDES_DIR = os.path.join(GRADIO_DIR, "guides")
GUIDE_ASSETS_DIR = os.path.join(GUIDES_DIR, "assets")
DEMOS_DIR = os.path.join(GRADIO_DIR, "demo")

UNDERSCORE_TOKEN = "!UNDERSCORE!"

demos = {}
for demo_folder in os.listdir(DEMOS_DIR):
    runfile = os.path.join(DEMOS_DIR, demo_folder, "run.py")
    if not os.path.exists(runfile):
        continue
    with open(runfile) as run_py:
        demos[demo_folder] = run_py.read().replace(
            'if __name__ == "__main__":\n    demo.launch()', "demo.launch()"
        )


def format_name(guide_name):
    index = None
    if re.match("^[0-9]+_", guide_name):
        index = int(guide_name[: guide_name.index("_")])
        guide_name = guide_name[guide_name.index("_") + 1 :]
    if guide_name.lower().endswith(".md"):
        guide_name = guide_name[:-3]
    pretty_guide_name = " ".join([word[0].upper() + word[1:] for word in guide_name.split("-")])
    return index, guide_name, pretty_guide_name


guide_folders = sorted(os.listdir(GUIDES_DIR))
guide_folders.remove("CONTRIBUTING.md")
guide_folders.remove("assets")

guides = []
guides_by_category = []
absolute_index = 0
for guide_folder in guide_folders:
    guide_list = sorted(os.listdir(os.path.join(GUIDES_DIR, guide_folder)))
    _, guide_category, pretty_guide_category = format_name(guide_folder)
    guides_by_category.append({"category": pretty_guide_category, "guides": []})
    for guide_file in guide_list:
        guide_index, guide_name, pretty_guide_name = format_name(guide_file)
        with open(os.path.join(GUIDES_DIR, guide_folder, guide_file), "r") as f:
            guide_content = f.read()

        title = guide_content.split("\n")[0]

        metadata_labels = []

        def get_labeled_metadata(label, is_list=True):
            metadata_labels.append(label)
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

        url = f"/{guide_name}/"

        content_no_html = guide_content

        guide_content = "\n".join(
            [
                line
                for i, line in enumerate(guide_content.split("\n"))
                if not any([line.startswith(label) for label in metadata_labels])
            ]
        )
        guide_content = re.sub(
            r"```([a-z]+)\n",
            lambda x: f"<div class='codeblock'><pre><code class='lang-{x.group(1)}'>",
            guide_content,
        )
        guide_content = re.sub(r"```", "</code></pre></div>", guide_content)
        guide_content = re.sub(
            r"\$code_([a-z _\-0-9]+)",
            lambda x: f"<div class='codeblock'><pre><code class='lang-python'>{demos[x.group(1)]}</code></pre></div>",
            guide_content,
        )
        guide_content = re.sub(
            r"\$demo_([a-z _\-0-9]+)",
            lambda x: f"<gradio-app space='gradio/{x.group(1).replace('_', UNDERSCORE_TOKEN)}' />",
            guide_content,
        )
        guide_html = markdown2.markdown(
                    guide_content,
                            extras=[
                                "target-blank-links",
                                "header-ids",
                                "tables",
                                "fenced-code-blocks",
                            ],
                ).replace(UNDERSCORE_TOKEN, "_")


        guide_data = {
            "name": guide_name,
            "category": guide_category,
            "pretty_category": pretty_guide_category,
            "guide_index": guide_index,
            "absolute_index": absolute_index,
            "pretty_name": pretty_guide_name,
            "content": content_no_html,
            "html": guide_html,
            "tags": tags,
            "spaces": spaces,
            "url": url,
            "contributor": contributor,
        }
        guides.append(guide_data)
        guides_by_category[-1]["guides"].append(guide_data)
        absolute_index += 1


def generate(json_path):
    with open(json_path, 'w+') as f:
        json.dump({
            "guides": guides,
            "guides_by_category": guides_by_category
            }, f)


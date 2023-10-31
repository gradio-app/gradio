import json
import os
import re

DIR = os.path.dirname(__file__)
GUIDES_DIR = os.path.abspath(os.path.join(DIR, "../../../../../guides"))
GUIDE_ASSETS_DIR = os.path.join(GUIDES_DIR, "assets")
DEMOS_DIR = os.path.abspath(os.path.join(DIR, "../../../../../demo"))
CN_GUIDES_DIR = os.path.abspath(os.path.join(DIR, "../../../../../guides/cn"))

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
guide_folders.remove("cn")

guides = []
guides_by_category = []
guide_names = []
guide_urls = []
absolute_index = 0
for guide_folder in guide_folders:
    guide_list = sorted(os.listdir(os.path.join(GUIDES_DIR, guide_folder)))
    _, guide_category, pretty_guide_category = format_name(guide_folder)
    guides_by_category.append({"category": pretty_guide_category, "guides": []})
    guide_names.append({"category": pretty_guide_category, "guides": []})
    for guide_file in guide_list:
        guide_index, guide_name, pretty_guide_name = format_name(guide_file)
        with open(os.path.join(GUIDES_DIR, guide_folder, guide_file)) as f:
            guide_content = f.read()

        title = guide_content.split("\n")[0]

        metadata_labels = []

        def get_labeled_metadata(label, is_list=True):
            global guide_content
            metadata_labels.append(label)
            full_label = label + " "
            metadata = [] if is_list else None
            if full_label in guide_content:
                metadata = guide_content.split(full_label)[1].split("\n")[0]
                guide_content = guide_content.replace(full_label + metadata, "")
                if is_list:
                    metadata = metadata.split(", ")
            return metadata

        tags = get_labeled_metadata("Tags:")
        spaces = get_labeled_metadata("Related spaces:")
        contributor = get_labeled_metadata("Contributed by", is_list=False)

        url = f"/guides/{guide_name}/"
        
        guide_content = re.sub(
            r"\$code_([a-z _\-0-9]+)",
            lambda x: f"```python\n{demos[x.group(1)]}\n```",
            guide_content,
        )
        guide_content = re.sub(
            r"\$demo_([a-z _\-0-9]+)",
            lambda x: f"<gradio-app space='gradio/{x.group(1)}'></gradio-app>",
            guide_content,
        )

        guide_content = re.sub(
            r"(\n\nTip: )(.*?)(?=\n\n|$)", 
            lambda x: f"<p class='tip'>💡 {x.group(2)}</p>", 
            guide_content,
        )

        content_no_html = guide_content

        guide_content = "\n".join(
            [
                line
                for i, line in enumerate(guide_content.split("\n"))
                if not any(line.startswith(label) for label in metadata_labels)
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
        


        guide_data = {
            "name": guide_name,
            "category": guide_category,
            "pretty_category": pretty_guide_category,
            "guide_index": guide_index,
            "absolute_index": absolute_index,
            "pretty_name": pretty_guide_name,
            "content": content_no_html,
            "tags": tags,
            "spaces": spaces,
            "url": url,
            "contributor": contributor,
        }
        guides.append(guide_data)
        guides_by_category[-1]["guides"].append(guide_data)
        guide_names[-1]["guides"].append({"name": guide_name, "pretty_name": pretty_guide_name, "url": url})
        guide_urls.append(guide_name)
        absolute_index += 1


def generate(json_path):
    if not os.path.isdir(json_path):
        os.mkdir(json_path)
    with open(json_path + "guides_by_category.json", 'w+') as f:
        json.dump({
            "guides_by_category": guides_by_category,
            }, f)
    for guide in guides: 
        with open(json_path + guide["name"] + ".json", 'w+') as f:
            json.dump({
                "guide": guide
                }, f)
    with open(json_path + "guide_names.json", 'w+') as f:
        json.dump({
            "guide_names": guide_names,
            "guide_urls": guide_urls
            }, f)



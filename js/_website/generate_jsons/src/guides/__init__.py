import json
import os
import re
import markdown

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
        ).replace("# type: ignore", "")


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
            lambda x: f"""
            <div class='tip'>
                <span class="inline-flex" style="align-items: baseline">
                    <svg class="self-center w-5 h-5 mx-1" xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.25 18.7089C9.25 18.2894 9.58579 17.9494 10 17.9494H14C14.4142 17.9494 14.75 18.2894 14.75 18.7089C14.75 19.1283 14.4142 19.4684 14 19.4684H10C9.58579 19.4684 9.25 19.1283 9.25 18.7089ZM9.91667 21.2405C9.91667 20.821 10.2525 20.481 10.6667 20.481H13.3333C13.7475 20.481 14.0833 20.821 14.0833 21.2405C14.0833 21.66 13.7475 22 13.3333 22H10.6667C10.2525 22 9.91667 21.66 9.91667 21.2405Z"/>
                        <path d="M7.41058 13.8283L8.51463 14.8807C8.82437 15.1759 9 15.5875 9 16.0182C9 16.6653 9.518 17.1899 10.157 17.1899H13.843C14.482 17.1899 15 16.6653 15 16.0182C15 15.5875 15.1756 15.1759 15.4854 14.8807L16.5894 13.8283C18.1306 12.3481 18.9912 10.4034 18.9999 8.3817L19 8.29678C19 4.84243 15.866 2 12 2C8.13401 2 5 4.84243 5 8.29678L5.00007 8.3817C5.00875 10.4034 5.86939 12.3481 7.41058 13.8283Z"/>
                    </svg>
                <span><strong>Tip:</strong></span>
                </span>
                {markdown.markdown(x.group(2))}
            </div>
                """,
            guide_content,
        )

        guide_content = re.sub(
            r"(\n\nWarning: )(.*?)(?=\n\n|$)", 
            lambda x: f"""
            <div class='warning'>
                <span class="inline-flex" style="align-items: baseline">
                    <svg class="self-center w-5 h-5 mx-1" xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' version='1.1' width='800px' height='800px' viewBox='0 0 554.2 554.199' xml:space='preserve'>
                        <path d='M538.5,386.199L356.5,70.8c-16.4-28.4-46.7-45.9-79.501-45.9c-32.8,0-63.1,17.5-79.5,45.9L12.3,391.6   c-16.4,28.4-16.4,63.4,0,91.8C28.7,511.8,59,529.3,91.8,529.3H462.2c0.101,0,0.2,0,0.2,0c50.7,0,91.8-41.101,91.8-91.8   C554.2,418.5,548.4,400.8,538.5,386.199z M316.3,416.899c0,21.7-16.7,38.3-39.2,38.3s-39.2-16.6-39.2-38.3V416   c0-21.601,16.7-38.301,39.2-38.301S316.3,394.3,316.3,416V416.899z M317.2,158.7L297.8,328.1c-1.3,12.2-9.4,19.8-20.7,19.8   s-19.4-7.7-20.7-19.8L237,158.6c-1.3-13.1,5.801-23,18-23H299.1C311.3,135.7,318.5,145.6,317.2,158.7z'/>
                    </svg>
                <span><strong>Warning:</strong></span>
                </span>
                {markdown.markdown(x.group(2))}
            </div>
                """, 
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



import os
import markdown2
import shutil
import re

DIR = os.path.dirname(__file__)
RELEASES_DIR = os.path.join(DIR, "..", "..", "..", "releases")

def render_md(version_filename):
    with open(os.path.join(RELEASES_DIR, version_filename), "r") as change_file:
        content = change_file.read()
    
    # replace code blocks correctly
    content = re.sub(
            r"```([a-z]+)\n",
            lambda x: f"<div class='codeblock'><pre><code class='lang-{x.group(1)}'>",
            content,
        )
    content = re.sub(r"```", "</code></pre></div>", content)

    # replace pr tags with links
    content = re.sub(
            r"\:pr\:(\d[^\n ]*)",
            lambda x: f"<a href='https://github.com/gradio-app/gradio/pull/{x.group(1)}'>https://github.com/gradio-app/gradio/pull/{x.group(1)}</a>",
            content,
        )
    
    # replace @ usernames with links
    content = re.sub(
            r"\@([^\n ]*)",
            lambda x: f"<a href='https://github.com/{x.group(1)}'>@{x.group(1)}</a>",
            content,
        ) 
   
    # remove empty/unused sections
    content = re.sub(r"## [\w^:\n ]*No changes to highlight.", "", content)

    content_html = markdown2.markdown(
                content,
                extras=[
                    "target-blank-links",
                    "header-ids",
                    "tables",
                    "fenced-code-blocks",
                ],
            )

    with open(os.path.join(DIR, f"{version_filename[:-3]}.html"), "w+") as temp_html:
        temp_html.write(content_html)

versions = []
for version_filename in os.listdir(RELEASES_DIR):
    if version_filename == "TEMPLATE.md":
        continue
    render_md(version_filename)
    versions.append(version_filename[:-3])

versions.remove("UPCOMING")
versions.sort(reverse=True)
versions = ["UPCOMING"] + versions

def build(output_dir, jinja_env):
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("changelog/parent_template.html")
    output = template.render(versions=versions)
    output_folder = os.path.join(output_dir, "changelog")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)

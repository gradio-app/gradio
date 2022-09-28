import os
import markdown2
import shutil
import re

DIR = os.path.dirname(__file__)
INNER_TEMPLATE_FILE = os.path.join(DIR, "inner_template.html")
CHANGELOG_FILE = os.path.join(DIR, "..", "..", "..", "CHANGELOG.md")

def render_md(filepath):
    with open(CHANGELOG_FILE, "r") as change_file:
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
    # section_titles = [
    #     "New Features", 
    #     "Bug Fixes", 
    #     "Documentation Changes", 
    #     "Testing and Infrastructure Changes", 
    #     "Breaking Changes",
    #     "Full Changelog",
    #     "Contributors Shoutout"
    # ]

    # for index, title in enumerate(section_titles):
    #     title = f"## {title}:\n"
    #     if title in content:
    #         if index == len(section_titles) - 1: 
    #             section = content.split(title)[1]
    #         else:
    #             next_title =  f"## {section_titles[index + 1]}:\n"
    #             section = content.split(title)[1].split(next_title)[0]
    #         print("\n\n\n\n----------")
    #         print(section)
    #         print("----------\n\n\n\n")
    #         if not any(char.isalnum() for char in section): 
    #             content.replace(title + section, "")

        

    # get versions and their correct href
    versions = re.findall(r"# Version \d\.\d[^\n ]*", content)
    versions = [("Upcoming Release", "upcoming-release")] + [("v" + v.strip("# Version "), "version-" + v.strip("# Version ").replace('.','')) for v in versions]

    content_html = markdown2.markdown(
                content,
                extras=[
                    "target-blank-links",
                    "header-ids",
                    "tables",
                    "fenced-code-blocks",
                ],
            )

    with open(INNER_TEMPLATE_FILE, "w+") as temp_html:
        temp_html.write(content_html)
    
    return versions

def build(output_dir, jinja_env):
    versions = render_md(CHANGELOG_FILE)
    os.makedirs(output_dir, exist_ok=True)
    template = jinja_env.get_template("changelog/parent_template.html")
    output = template.render(versions=versions)
    output_folder = os.path.join(output_dir, "changelog")
    os.makedirs(output_folder)
    output_file = os.path.join(output_folder, "index.html")
    with open(output_file, "w") as index_html:
        index_html.write(output)

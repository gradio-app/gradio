import json
import os
import re
import markdown

DIR = os.path.dirname(__file__)
BLOGS_DIR = os.path.abspath(os.path.join(DIR, "../../../../../blogs"))


def format_name(blog_name):
    index = None
    if re.match("^[0-9]+_", blog_name):
        index = int(blog_name[: blog_name.index("_")])
        blog_name = blog_name[blog_name.index("_") + 1 :]
    if blog_name.lower().endswith(".md"):
        blog_name = blog_name[:-3]
    pretty_blog_name = " ".join(
        [word[0].upper() + word[1:] for word in blog_name.split("-")]
    )
    return index, blog_name, pretty_blog_name


blog_folders = sorted(
    [
        f
        for f in os.listdir(BLOGS_DIR)
        if os.path.isdir(os.path.join(BLOGS_DIR, f)) and re.match(r"^\d+_", f)
    ]
)

blogs = []
blogs_by_category = []
blog_names = []
blog_urls = []
absolute_index = 0
for blog_folder in blog_folders:
    blog_list = sorted(os.listdir(os.path.join(BLOGS_DIR, blog_folder)))
    blog_list = [f for f in blog_list if f.endswith(".md")]
    _, blog_category, pretty_blog_category = format_name(blog_folder)
    blogs_by_category.append({"category": pretty_blog_category, "blogs": []})
    blog_names.append({"category": pretty_blog_category, "blogs": []})
    for blog_file in blog_list:
        blog_index, blog_name, pretty_blog_name = format_name(blog_file)
        with open(os.path.join(BLOGS_DIR, blog_folder, blog_file)) as f:
            blog_content = f.read()

        title = blog_content.split("\n")[0]

        metadata_labels = []

        def get_labeled_metadata(label, is_list=True):
            global blog_content
            metadata_labels.append(label)
            full_label = label + " "
            metadata = [] if is_list else None
            if full_label in blog_content:
                metadata = blog_content.split(full_label)[1].split("\n")[0]
                blog_content = blog_content.replace(full_label + metadata, "")
                if is_list:
                    metadata = metadata.split(", ")
            return metadata

        tags = get_labeled_metadata("Tags:")
        author = get_labeled_metadata("Author:", is_list=False)
        date = get_labeled_metadata("Date:", is_list=False)

        url = f"/blog/{blog_name}/"

        blog_content = re.sub(
            r"\n\nTip: (.*?)(?=\n\n|$)",
            lambda x: f"""
            <div class='tip'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                    <path d="M9 18h6"/>
                    <path d="M10 22h4"/>
                </svg>
                <div>{markdown.markdown(x.group(1))}</div>
            </div>
                """,
            blog_content,
        )

        blog_content = re.sub(
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
            blog_content,
        )

        content_no_html = blog_content

        blog_content = "\n".join(
            [
                line
                for i, line in enumerate(blog_content.split("\n"))
                if not any(line.startswith(label) for label in metadata_labels)
            ]
        )

        blog_content = re.sub(
            r"```([a-z]+)\n",
            lambda x: f"<div class='codeblock'><pre><code class='lang-{x.group(1)}'>",
            blog_content,
        )
        blog_content = re.sub(r"```", "</code></pre></div>", blog_content)

        blog_data = {
            "name": blog_name,
            "category": blog_category,
            "pretty_category": pretty_blog_category,
            "blog_index": blog_index,
            "absolute_index": absolute_index,
            "pretty_name": pretty_blog_name,
            "content": content_no_html,
            "tags": tags,
            "author": author,
            "date": date,
            "url": url,
        }
        blogs.append(blog_data)
        blogs_by_category[-1]["blogs"].append(blog_data)
        blog_names[-1]["blogs"].append(
            {"name": blog_name, "pretty_name": pretty_blog_name, "url": url}
        )
        blog_urls.append(blog_name)
        absolute_index += 1


def generate(json_path):
    if not os.path.isdir(json_path):
        os.mkdir(json_path)
    with open(json_path + "blogs_by_category.json", "w+") as f:
        json.dump(
            {
                "blogs_by_category": blogs_by_category,
            },
            f,
        )
    for blog in blogs:
        with open(json_path + blog["name"] + ".json", "w+") as f:
            json.dump({"blog": blog}, f)
    with open(json_path + "blog_names.json", "w+") as f:
        json.dump({"blog_names": blog_names, "blog_urls": blog_urls}, f)

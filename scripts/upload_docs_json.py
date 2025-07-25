from huggingface_hub import HfApi
import html2text
from bs4 import BeautifulSoup 
import re
from pathlib import Path
import json
from subprocess import run

api = HfApi()

def obj_divs_to_markdown(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    objs = soup.select("div.obj")
    if not objs:
        return ""
    obj_html = "\n".join(div.decode_contents() for div in objs)
    md_text = html2text.html2text(obj_html).replace("![](https://raw.githubusercontent.com/gradio-\napp/gradio/main/js/_website/src/lib/assets/img/anchor.svg)", "")
    md_text = md_text.replace("🔗\n", "")
    md_text = re.sub(r'###\s*Guides[\s\S]*\Z', '', md_text)
    return md_text


MAX_LEN   = 2000
OVERLAP   = 200
H3_PATTERN = re.compile(r"^(###\s+.+)$", re.M)
H2_PATTERN = re.compile(r"^(##\s+.+)$", re.M)

def split_with_overlap(text: str, max_len: int = MAX_LEN, overlap: int = OVERLAP):
    """Yield slices of text each ≤ max_len, adding `overlap` chars of context."""
    start = 0
    while start < len(text):
        end = start + max_len
        yield text[start:end]
        start = end - overlap

def markdown_to_docs(markdown: str, *, page_url: str, page_title: str, docs: list, split_by_h2: bool = False):
    """
    Convert a Markdown string into an array of doc dictionaries, each ≤ 2000 chars.
    Sections are split on h_type headings; oversized sections are broken up with overlap.
    """

    H_PATTERN = H2_PATTERN if split_by_h2 else H3_PATTERN

    headings = [(m.start(), m.end(), m.group(1).lstrip("# ").strip())
                for m in H_PATTERN.finditer(markdown)]
    headings.append((len(markdown), len(markdown), None))

    for idx in range(len(headings) - 1):
        start, h_end, h_text = headings[idx]
        next_start, _, _     = headings[idx + 1]
        section_body         = markdown[h_end:next_start].lstrip()

        chunks = ([section_body] if len(section_body) <= MAX_LEN
                  else list(split_with_overlap(section_body)))

        for i, chunk in enumerate(chunks):
            heading = h_text
            docs.append(
                dict(
                    text=chunk.replace("# ", "").replace("#", ""),
                    heading1=heading,
                    source_page_url=page_url,
                    source_page_title=page_title,
                )
            )
    return docs


if __name__ == "__main__":
    ROOT = Path(__file__).parent.parent
    DOCS_DIR = (ROOT / "js/_website/build/docs").resolve()
    GUIDES_DIR = (ROOT / "guides").resolve()
    docs = []
    for dir in DOCS_DIR.iterdir():
        if dir.is_dir():
            for file in dir.iterdir():
                if file.is_file() and file.suffix == ".html":
                    html = file.read_text(encoding="utf-8")
                    markdown = obj_divs_to_markdown(html)

                    page_url = f"https://gradio.app/docs/{dir.name}/{file.name.replace('.html', '')}"
                    page_title = f"{dir.name.replace('-', ' ').title()} - {file.name.replace('.html', '').replace('-', ' ').title()} Docs"

                    docs = markdown_to_docs(
                        markdown,
                        page_url = page_url,
                        page_title = page_title,
                        docs = docs
                    )

    for dir in GUIDES_DIR.iterdir():
        if dir.is_dir() and dir.name not in ["assets", "cn"]:
            for file in dir.iterdir():
                if file.is_file() and file.suffix == ".md":
                    markdown = file.read_text(encoding="utf-8")
                    page_name = file.name.replace(".md", "")
                    page_name = re.sub(r'^\d+_', '', page_name)
                    dir_name = dir.name.replace("-", " ")
                    dir_name = re.sub(r'^\d+_', '', dir_name)
                    page_url = f"https://gradio.app/guides/{page_name}"
                    page_title = f"{dir_name.title()} - {page_name.replace('-', ' ').title()} Guide"

                    docs = markdown_to_docs(
                        markdown,
                        page_url = page_url,
                        page_title = page_title,
                        docs = docs,
                        split_by_h2 = True
                    )

    print(f"Generated {len(docs)} chunks.")

    with open((ROOT / "scripts/docs.json").resolve(), "w") as f:
        json.dump(docs, f)
    
    result = run(
        ["git", "log", "-1", "--pretty=format:%H|%s"],
        capture_output=True,
        text=True,     
        check=True
    )
    sha, subject = result.stdout.strip().split("|", 1)
    commit_hash = sha[:7]
    commit_message = subject if len(subject) <= 30 else subject[:30] + "..."

    try:
        commit_info = api.upload_file(
            path_or_fileobj=(ROOT / "scripts/docs.json").resolve(),        
            path_in_repo="docs.json",
            repo_id="gradio/docs",
            repo_type="dataset",
            commit_message=f"Changes from: {commit_hash} '{commit_message}'"
        )
        print("✅  docs.json uploaded")
    except Exception as e:
        print(f"❌  Error uploading docs.json: {e}")



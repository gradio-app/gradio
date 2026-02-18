"""Generates .agents/skills/gradio/ from Gradio's docstrings, guides, and demos.

Usage:
    python scripts/generate_skill.py          # regenerate
    python scripts/generate_skill.py --check  # CI: fail if output would change
"""

import argparse
import os
import re
import shutil
import sys
import tempfile

DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(DIR, ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "client", "python"))
sys.path.insert(0, REPO_ROOT)

from gradio_client.documentation import generate_documentation  # noqa: E402

import gradio  # noqa: E402, F401

GUIDES_DIR = os.path.join(REPO_ROOT, "guides")
DEMOS_DIR = os.path.join(REPO_ROOT, "demo")
SKILL_DIR = os.path.join(REPO_ROOT, ".agents", "skills", "gradio")

CURATED_GUIDES = [
    "quickstart",
    "the-interface-class",
    "blocks-and-event-listeners",
    "controlling-layout",
    "more-blocks-features",
    "custom-CSS-and-JS",
    "streaming-outputs",
    "streaming-inputs",
    "sharing-your-app",
    "custom-HTML-components",
]

IMPORTANT_DEMOS = [
    "blocks_essay_simple",
    "blocks_flipper",
    "blocks_form",
    "blocks_hello",
    "blocks_layout",
    "calculator",
    "chatbot_simple",
    "chatbot_streaming",
    "chatinterface_multimodal",
    "custom_css",
    "fake_diffusion",
    "hello_world",
    "image_editor",
    "on_listener_decorator",
    "render_merge",
    "reverse_audio_2",
    "sepia_filter",
    "sort_records",
    "streaming_simple",
    "tabbed_interface_lite",
    "tax_calculator",
    "timer_simple",
    "variable_outputs",
    "video_identity",
]

KEY_COMPONENTS = [
    "Textbox",
    "Number",
    "Slider",
    "Checkbox",
    "Dropdown",
    "Radio",
    "Image",
    "Audio",
    "Video",
    "File",
    "Chatbot",
    "DataFrame",
    "Button",
    "Markdown",
    "HTML",
]


def load_all_demo_code():
    demos = {}
    for demo_folder in os.listdir(DEMOS_DIR):
        runfile = os.path.join(DEMOS_DIR, demo_folder, "run.py")
        if not os.path.exists(runfile):
            continue
        with open(runfile) as f:
            code = f.read()
            code = code.replace("# type: ignore", "").replace(
                'if __name__ == "__main__":\n    demo.launch()', "demo.launch()"
            )
            demos[demo_folder] = code
    return demos


def find_guide_file(guide_name):
    for folder in sorted(os.listdir(GUIDES_DIR)):
        folder_path = os.path.join(GUIDES_DIR, folder)
        if not os.path.isdir(folder_path) or folder in ("assets", "cn"):
            continue
        for filename in os.listdir(folder_path):
            stripped = re.sub(r"^[0-9]+_", "", filename)
            if stripped.replace(".md", "") == guide_name:
                return os.path.join(folder_path, filename)
    return None


def build_signature(entry):
    params = ", ".join(
        p["name"]
        + ": "
        + str(p["annotation"])
        + (" = " + str(p["default"]) if "default" in p else "")
        for p in entry["parameters"]
    )
    return f"{entry['name']}({params})"


def organize_docs(raw_docs):
    organized = {
        "building": {},
        "components": {},
        "helpers": {},
        "modals": {},
        "routes": {},
        "chatinterface": {},
    }
    for mode in raw_docs:
        for c in raw_docs[mode]:
            for p in c.get("parameters", []):
                p["annotation"] = str(p["annotation"])
                if "default" in p:
                    p["default"] = str(p["default"])
            for fn in c["fns"]:
                for p in fn.get("parameters", []):
                    p["annotation"] = str(p["annotation"])
                    if "default" in p:
                        p["default"] = str(p["default"])
            if mode == "component":
                organized["components"][c["name"]] = c
            elif mode == "py-client":
                continue
            elif mode in organized:
                organized[mode][c["name"]] = c
            else:
                organized["building"][c["name"]] = c
    return organized


def build_events_matrix(organized):
    component_events = {}
    for name, comp in organized["components"].items():
        if hasattr(comp.get("class"), "EVENTS"):
            events = [fn["name"] for fn in comp["fns"] if fn["name"] in [str(e) for e in comp["class"].EVENTS]]
            if events:
                component_events[name] = events
    return component_events


def generate_examples(all_demos):
    lines = ["# Gradio End-to-End Examples\n"]
    lines.append("Complete working Gradio apps for reference.\n")

    for demo_name in IMPORTANT_DEMOS:
        if demo_name not in all_demos:
            continue
        pretty = demo_name.replace("_", " ").title()
        code = all_demos[demo_name].strip()
        lines.append(f"## {pretty}\n")
        lines.append(f"```python\n{code}\n```\n")

    return "\n".join(lines)


def generate_skill_md(organized, guide_links):
    key_sigs = []
    for name in KEY_COMPONENTS:
        if name in organized["components"]:
            entry = organized["components"][name]
            sig = build_signature(entry)
            desc = entry.get("description", "").replace("<br>", " ").strip()
            first_sentence = desc.split(". ")[0] + "." if desc else ""
            key_sigs.append(f"### `{sig}`\n{first_sentence}\n")

    events_matrix = build_events_matrix(organized)
    event_lines = []
    for comp, events in sorted(events_matrix.items()):
        event_lines.append(f"- **{comp}**: {', '.join(events)}")

    guide_list = "\n".join(f"- [{title}]({path})" for title, path in guide_links)

    skill_md = f"""---
name: gradio
description: Build Gradio web UIs and demos in Python. Use when creating or editing Gradio apps, components, event listeners, layouts, or chatbots.
---

# Gradio

Gradio is a Python library for building interactive web UIs and ML demos. This skill covers the core API, patterns, and examples.

## Guides

Detailed guides on specific topics (read these when relevant):

{guide_list}

## Core Patterns

**Interface** (high-level): wraps a function with input/output components.

```python
import gradio as gr

def greet(name):
    return f"Hello {{name}}!"

gr.Interface(fn=greet, inputs="text", outputs="text").launch()
```

**Blocks** (low-level): flexible layout with explicit event wiring.

```python
import gradio as gr

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Greeting")
    btn = gr.Button("Greet")
    btn.click(fn=lambda n: f"Hello {{n}}!", inputs=name, outputs=output)

demo.launch()
```

**ChatInterface**: high-level wrapper for chatbot UIs.

```python
import gradio as gr

def respond(message, history):
    return f"You said: {{message}}"

gr.ChatInterface(fn=respond).launch()
```

## Key Component Signatures

{chr(10).join(key_sigs)}

## Event Listeners

All event listeners share the same signature:

```python
component.event_name(fn, inputs, outputs, ...)
```

Supported events per component:

{chr(10).join(event_lines)}

## Additional Reference

- [End-to-End Examples](examples.md) — complete working apps
"""
    return skill_md.strip() + "\n"


GUIDE_TITLES = {
    "quickstart": "Quickstart",
    "the-interface-class": "The Interface Class",
    "blocks-and-event-listeners": "Blocks and Event Listeners",
    "controlling-layout": "Controlling Layout",
    "more-blocks-features": "More Blocks Features",
    "custom-CSS-and-JS": "Custom CSS and JS",
    "streaming-outputs": "Streaming Outputs",
    "streaming-inputs": "Streaming Inputs",
    "sharing-your-app": "Sharing Your App",
    "custom-HTML-components": "Custom HTML Components",
}


def generate_to(output_dir, relpath_base=None):
    raw_docs = generate_documentation()
    organized = organize_docs(raw_docs)
    all_demos = load_all_demo_code()

    os.makedirs(output_dir, exist_ok=True)
    base = relpath_base or output_dir

    guide_links = []
    for guide_name in CURATED_GUIDES:
        source = find_guide_file(guide_name)
        if source is None:
            print(f"Warning: guide '{guide_name}' not found, skipping")
            continue
        rel = os.path.relpath(source, base)
        title = GUIDE_TITLES.get(guide_name, guide_name.replace("-", " ").title())
        guide_links.append((title, rel))

    skill_md = generate_skill_md(organized, guide_links)
    with open(os.path.join(output_dir, "SKILL.md"), "w") as f:
        f.write(skill_md)

    examples = generate_examples(all_demos)
    with open(os.path.join(output_dir, "examples.md"), "w") as f:
        f.write(examples)

    return skill_md


def files_equal(path1, path2):
    if not os.path.exists(path1) or not os.path.exists(path2):
        return False
    with open(path1) as f1, open(path2) as f2:
        return f1.read() == f2.read()


def check(output_dir):
    tmp = tempfile.mkdtemp()
    try:
        tmp_skill = os.path.join(tmp, "gradio")
        generate_to(tmp_skill, relpath_base=output_dir)

        generated_files = ["SKILL.md", "examples.md"]
        stale = []
        for fname in generated_files:
            existing = os.path.join(output_dir, fname)
            fresh = os.path.join(tmp_skill, fname)
            if not files_equal(existing, fresh):
                stale.append(fname)

        if stale:
            print("ERROR: Skill files are out of date. Stale files:")
            for f in stale:
                print(f"  {f}")
            print("\nRun `python scripts/generate_skill.py` to update.")
            sys.exit(1)

        print("OK: Skill files are up to date.")
    finally:
        shutil.rmtree(tmp)


def main():
    parser = argparse.ArgumentParser(description="Generate Gradio skill files.")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check if files are up to date (for CI). Exits with code 1 if stale.",
    )
    args = parser.parse_args()

    if args.check:
        check(SKILL_DIR)
        return

    print("Generating Gradio skill...")

    if os.path.exists(SKILL_DIR):
        shutil.rmtree(SKILL_DIR)

    skill_md = generate_to(SKILL_DIR)
    skill_lines = len(skill_md.splitlines())

    for name in os.listdir(SKILL_DIR):
        path = os.path.join(SKILL_DIR, name)
        if os.path.isdir(path) and not os.path.islink(path):
            count = len(os.listdir(path))
            print(f"  {name}/: {count} files")
        elif os.path.isfile(path):
            with open(path) as f:
                lines = len(f.readlines())
            print(f"  {name}: {lines} lines")

    print(f"\nDone! Output in {SKILL_DIR}")
    if skill_lines > 500:
        print(f"  WARNING: SKILL.md is {skill_lines} lines (recommended <500)")


if __name__ == "__main__":
    main()

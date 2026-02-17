"""Generates .agents/skills/gradio/ from Gradio's docstrings, guides, and demos."""

import os
import re
import shutil
import sys

DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(DIR, ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "client", "python"))
sys.path.insert(0, REPO_ROOT)

import gradio  # noqa: E402, F401
from gradio_client.documentation import generate_documentation  # noqa: E402

GUIDES_DIR = os.path.join(REPO_ROOT, "guides")
DEMOS_DIR = os.path.join(REPO_ROOT, "demo")
SKILL_DIR = os.path.join(REPO_ROOT, ".agents", "skills", "gradio")
PACKAGE_SKILL_DIR = os.path.join(REPO_ROOT, "gradio", "skill_data")

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


def load_guide(guide_name, all_demos):
    path = find_guide_file(guide_name)
    if path is None:
        print(f"Warning: guide '{guide_name}' not found, skipping")
        return None

    with open(path) as f:
        content = f.read()

    for label in ("Tags:", "Related spaces:", "Contributed by"):
        if label in content:
            content = re.sub(rf"^{re.escape(label)}.*$", "", content, flags=re.MULTILINE)

    content = re.sub(
        r"\$code_([a-z _\-0-9]+)",
        lambda m: f"```python\n{all_demos.get(m.group(1), '# demo not found')}\n```",
        content,
    )

    content = re.sub(r"\$demo_([a-z _\-0-9]+)", "", content)

    content = re.sub(r"\n{3,}", "\n\n", content).strip()
    return content


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


def generate_api_reference(organized):
    lines = ["# Gradio API Reference\n"]
    lines.append("Complete class and function signatures for the Gradio library.\n")

    section_titles = {
        "components": "Components",
        "building": "Building Blocks",
        "helpers": "Helpers",
        "chatinterface": "ChatInterface",
        "modals": "Modals",
        "routes": "Routes",
    }

    for key, title in section_titles.items():
        if not organized.get(key):
            continue
        lines.append(f"\n## {title}\n")
        for name, entry in sorted(organized[key].items()):
            sig = build_signature(entry)
            lines.append(f"### `{sig}`\n")
            if entry.get("description"):
                desc = entry["description"].replace("<br>", " ").strip()
                lines.append(f"{desc}\n")
            if "fns" in entry and key != "components":
                for fn in entry["fns"]:
                    fn_params = ", ".join(
                        p["name"]
                        + ": "
                        + str(p["annotation"])
                        + (" = " + str(p["default"]) if "default" in p else "")
                        for p in fn["parameters"]
                    )
                    fn_sig = f"{name}.{fn['name']}({fn_params})"
                    lines.append(f"#### `{fn_sig}`\n")
                    if fn.get("description"):
                        fn_desc = fn["description"].replace("<br>", " ").strip()
                        lines.append(f"{fn_desc}\n")

    events_matrix = build_events_matrix(organized)
    if events_matrix:
        lines.append("\n## Event Listeners\n")
        lines.append(
            "Event listeners respond to user interactions. "
            "All event listeners share the same signature pattern:\n"
        )
        lines.append("```python\ncomponent.event_name(fn, inputs, outputs, ...)\n```\n")
        lines.append("Each component supports specific events:\n")
        for comp, events in sorted(events_matrix.items()):
            lines.append(f"- **{comp}**: {', '.join(events)}")
        lines.append("")

    return "\n".join(lines)


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


def generate_skill_md(organized):
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

    skill_md = f"""---
name: gradio
description: Build Gradio web UIs and demos in Python. Use when creating or editing Gradio apps, components, event listeners, layouts, or chatbots.
---

# Gradio

Gradio is a Python library for building interactive web UIs and ML demos. This skill covers the core API, patterns, and examples.

## Guides

Detailed guides on specific topics (read these when relevant):

- [Quickstart](guides/quickstart.md)
- [The Interface Class](guides/the-interface-class.md)
- [Blocks and Event Listeners](guides/blocks-and-event-listeners.md)
- [Controlling Layout](guides/controlling-layout.md)
- [More Blocks Features](guides/more-blocks-features.md)
- [Custom CSS and JS](guides/custom-CSS-and-JS.md)
- [Streaming Outputs](guides/streaming-outputs.md)
- [Streaming Inputs](guides/streaming-inputs.md)
- [Sharing Your App](guides/sharing-your-app.md)
- [Custom HTML Components](guides/custom-HTML-components.md)

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

- [Full API Reference](api-reference.md) — all class/function signatures
- [End-to-End Examples](examples.md) — complete working apps
"""
    return skill_md.strip() + "\n"


def main():
    print("Generating Gradio skill...")

    raw_docs = generate_documentation()
    organized = organize_docs(raw_docs)
    all_demos = load_all_demo_code()

    if os.path.exists(SKILL_DIR):
        shutil.rmtree(SKILL_DIR)
    os.makedirs(SKILL_DIR, exist_ok=True)
    os.makedirs(os.path.join(SKILL_DIR, "guides"), exist_ok=True)

    skill_md = generate_skill_md(organized)
    with open(os.path.join(SKILL_DIR, "SKILL.md"), "w") as f:
        f.write(skill_md)
    skill_lines = len(skill_md.splitlines())
    print(f"  SKILL.md: {skill_lines} lines")

    api_ref = generate_api_reference(organized)
    with open(os.path.join(SKILL_DIR, "api-reference.md"), "w") as f:
        f.write(api_ref)
    print(f"  api-reference.md: {len(api_ref.splitlines())} lines")

    for guide_name in CURATED_GUIDES:
        content = load_guide(guide_name, all_demos)
        if content is None:
            continue
        with open(os.path.join(SKILL_DIR, "guides", f"{guide_name}.md"), "w") as f:
            f.write(content)
        print(f"  guides/{guide_name}.md: {len(content.splitlines())} lines")

    examples = generate_examples(all_demos)
    with open(os.path.join(SKILL_DIR, "examples.md"), "w") as f:
        f.write(examples)
    print(f"  examples.md: {len(examples.splitlines())} lines")

    if os.path.exists(PACKAGE_SKILL_DIR):
        shutil.rmtree(PACKAGE_SKILL_DIR)
    shutil.copytree(SKILL_DIR, PACKAGE_SKILL_DIR)
    print(f"  Copied to package data: {PACKAGE_SKILL_DIR}")

    print(f"\nDone! Output in {SKILL_DIR}")
    if skill_lines > 500:
        print(f"  WARNING: SKILL.md is {skill_lines} lines (recommended <500)")


if __name__ == "__main__":
    main()

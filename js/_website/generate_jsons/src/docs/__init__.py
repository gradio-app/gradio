import json
import os

from gradio_client.documentation import document_cls, generate_documentation
import gradio
from ..guides import guides

import requests

DIR = os.path.dirname(__file__)
DEMOS_DIR = os.path.abspath(os.path.join(DIR, "../../../../../demo"))
JS_CLIENT_README = os.path.abspath(os.path.join(DIR, "../../../../../client/js/README.md"))
JS_DIR = os.path.abspath(os.path.join(DIR, "../../../../../js/"))

docs = generate_documentation()
docs["component"].sort(key=lambda x: x["name"])

def add_component_shortcuts():
    for component in docs["component"]:
        if not getattr(component["class"], "allow_string_shortcut", True):
            continue
        component["string_shortcuts"] = [
            (
                component["class"].__name__,
                component["name"].lower(),
                "Uses default values",
            )
        ]
        for subcls in component["class"].__subclasses__():
            if getattr(subcls, "is_template", False):
                _, tags, _ = document_cls(subcls)
                component["string_shortcuts"].append(
                    (
                        subcls.__name__,
                        subcls.__name__.lower(),
                        "Uses " + tags.get("sets", "default values"),
                    )
                )


add_component_shortcuts()


def add_demos():
    for mode in docs:
        for cls in docs[mode]:
            if "demos" not in cls["tags"]:
                continue
            cls["demos"] = []
            demos = [demo.strip() for demo in cls["tags"]["demos"].split(",")]
            for demo in demos:
                demo_file = os.path.join(DEMOS_DIR, demo, "run.py")
                with open(demo_file) as run_py:
                    demo_code = run_py.read()
                cls["demos"].append((demo, demo_code))


add_demos()

def create_events_matrix():
    events = set({})
    component_events = {}
    for component in docs["component"]:
        component_event_list = []
        for event in component["class"].EVENTS:
            events.add(event)
            for fn in component["fns"]:
                if event == fn["name"]:
                    component_event_list.append(event)
        component_events[component["name"]] = component_event_list
    
    
    return list(events), component_events

events, component_events = create_events_matrix()


def add_guides():
    for mode in docs:
        for cls in docs[mode]:
            if "guides" not in cls["tags"]:
                continue
            cls["guides"] = []
            docstring_guides = [
                guide.strip() for guide in cls["tags"]["guides"].split(",")
            ]
            for docstring_guide in docstring_guides:
                for guide in guides:
                    if docstring_guide == guide["name"]:
                        cls["guides"].append(guide)


add_guides()


def style_types():
    for mode in docs:
        for cls in docs[mode]:
            for tag in [
                "preprocessing",
                "postprocessing",
                "examples-format",
                "events",
            ]:
                if tag not in cls["tags"]:
                    continue
                cls[tag] = (
                    cls["tags"][tag]
                    .replace(
                        "{",
                        "<span class='text-orange-500' style='font-family: monospace; font-size: large;' >",
                    )
                    .replace("}", "</span>")
                )


style_types()


def override_signature(name, signature):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == name:
                cls["override_signature"] = signature


override_signature("Blocks", "with gradio.Blocks():")
override_signature("Row", "with gradio.Row():")
override_signature("Column", "with gradio.Column():")
override_signature("Tab", "with gradio.Tab():")
override_signature("Group", "with gradio.Group():")
override_signature("Dataset", "gr.Dataset(components, samples)")


def find_cls(target_cls):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == target_cls:
                return cls
    raise ValueError("Class not found")


def organize_docs(d):
    organized = {
        "building": {},
        "components": {},
        "helpers": {},
        "modals": {},
        "routes": {},
        "events": {},
        "py-client": {},
        "chatinterface": {}
    }
    pages = []
    for mode in d:
        for c in d[mode]:
            c["parent"] = "gradio"
            c["class"] = None
            if "returns" in c:
                c["returns"]["annotation"] = None
            for p in c.get("parameters", []):
                p["annotation"] = str(p["annotation"])
                if "default" in p:
                    p["default"] = str(p["default"])
            for f in c["fns"]:
                f["fn"] = None
                f["parent"] = "gradio." + c["name"]
                for p in f.get("parameters", []):
                    p["annotation"] = str(p["annotation"])
                    if "default" in p:
                        p["default"] = str(p["default"])
            if mode == "component":
                organized["components"][c["name"].lower()] = c
                pages.append(c["name"].lower())
            elif mode in ["helpers", "routes", "py-client", "chatinterface", "modals"]:
                organized[mode][c["name"].lower()] = c
                pages.append(c["name"].lower())
                
            else:
                # if mode not in organized["building"]:
                #     organized["building"][mode] = {}
                organized["building"][c["name"].lower()] = c
                pages.append(c["name"].lower())

    c_keys = list(organized["components"].keys())
    for i, cls in enumerate(organized["components"]):
        if not i:
            organized["components"][cls]["prev_obj"] = "Components"
            organized["components"][cls]["next_obj"] = organized["components"][
                c_keys[1]
            ]["name"]
        elif i == len(c_keys) - 1:
            organized["components"][cls]["prev_obj"] = organized["components"][
                c_keys[len(c_keys) - 2]
            ]["name"]
            organized["components"][cls]["next_obj"] = "load"
        else:
            organized["components"][cls]["prev_obj"] = organized["components"][
                c_keys[i - 1]
            ]["name"]
            organized["components"][cls]["next_obj"] = organized["components"][
                c_keys[i + 1]
            ]["name"]
    c_keys = list(organized["helpers"].keys())
    for i, cls in enumerate(organized["helpers"]):
        if not i:
            organized["helpers"][cls]["prev_obj"] = "Video"
            organized["helpers"][cls]["next_obj"] = organized["helpers"][c_keys[1]][
                "name"
            ]
        elif i == len(c_keys) - 1:
            organized["helpers"][cls]["prev_obj"] = organized["helpers"][
                c_keys[len(c_keys) - 2]
            ]["name"]
            organized["helpers"][cls]["next_obj"] = "Error"
        else:
            organized["helpers"][cls]["prev_obj"] = organized["helpers"][c_keys[i - 1]][
                "name"
            ]
            organized["helpers"][cls]["next_obj"] = organized["helpers"][c_keys[i + 1]][
                "name"
            ]
    c_keys = list(organized["modals"].keys())
    for i, cls in enumerate(organized["modals"]):
        if not i:
            organized["modals"][cls]["prev_obj"] = "EventData"
            organized["modals"][cls]["next_obj"] = organized["modals"][c_keys[1]][
                "name"
            ]
        elif i == len(c_keys) - 1:
            organized["modals"][cls]["prev_obj"] = organized["modals"][
                c_keys[len(c_keys) - 2]
            ]["name"]
            organized["modals"][cls]["next_obj"] = "Request"
        else:
            organized["modals"][cls]["prev_obj"] = organized["modals"][c_keys[i - 1]][
                "name"
            ]
            organized["modals"][cls]["next_obj"] = organized["modals"][c_keys[i + 1]][
                "name"
            ]

    c_keys = list(organized["routes"].keys())
    for i, cls in enumerate(organized["routes"]):
        if not i:
            organized["routes"][cls]["prev_obj"] = "Info"
            organized["routes"][cls]["next_obj"] = organized["routes"][c_keys[1]][
                "name"
            ]
        elif i == len(c_keys) - 1:
            organized["routes"][cls]["prev_obj"] = organized["routes"][
                c_keys[len(c_keys) - 2]
            ]["name"]
            organized["routes"][cls]["next_obj"] = "Flagging"
        else:
            organized["routes"][cls]["prev_obj"] = organized["routes"][c_keys[i - 1]][
                "name"
            ]
            organized["routes"][cls]["next_obj"] = organized["routes"][c_keys[i + 1]][
                "name"
            ]
    c_keys = list(organized["py-client"].keys())
    for i, cls in enumerate(organized["py-client"]):
        if not i:
            organized["py-client"][cls]["prev_obj"] = "Python-Client"
            organized["py-client"][cls]["next_obj"] = organized["py-client"][c_keys[1]][
                "name"
            ]
        elif i == len(c_keys) - 1:
            organized["py-client"][cls]["prev_obj"] = organized["py-client"][
                c_keys[len(c_keys) - 2]
            ]["name"]
            organized["py-client"][cls]["next_obj"] = "JS-Client"
        else:
            organized["py-client"][cls]["prev_obj"] = organized["py-client"][
                c_keys[i - 1]
            ]["name"]
            organized["py-client"][cls]["next_obj"] = organized["py-client"][
                c_keys[i + 1]
            ]["name"]
    
    for cls in organized["chatinterface"]:
        organized["chatinterface"][cls]["prev_obj"] = "Block-Layouts"
        organized["chatinterface"][cls]["next_obj"] = "Themes"

    layout_keys = ["row", "column", "tab", "group", "accordion"]
    for i, cls in enumerate(layout_keys):
        if not i:
            organized["building"][cls]["prev_obj"] = "Blocks"
            organized["building"][cls]["next_obj"] = layout_keys[i+1].capitalize()
        elif i == len(layout_keys) - 1:
            organized["building"][cls]["prev_obj"] = layout_keys[i-1].capitalize()
            organized["building"][cls]["next_obj"] = "Components"
        else:
            organized["building"][cls]["prev_obj"] = layout_keys[i-1].capitalize()
            organized["building"][cls]["next_obj"] = layout_keys[i+1].capitalize()


    organized["building"][cls]["prev_obj"]
    


    organized["events_matrix"] = component_events
    organized["events"] = events

    js = {}
    js_pages = []

    for js_component in os.listdir(JS_DIR):
        if not js_component.startswith("_") and js_component not in ["app", "highlighted-text", "playground", "preview", "upload-button", "theme", "tootils"]:
            if os.path.exists(os.path.join(JS_DIR, js_component, "package.json")):
                with open(os.path.join(JS_DIR, js_component, "package.json")) as f:
                    package_json = json.load(f)
                    if package_json.get("private", False):
                        continue
            if os.path.exists(os.path.join(JS_DIR, js_component, "README.md")):
                with open(os.path.join(JS_DIR, js_component, "README.md")) as f:
                    readme_content = f.read()

                try: 
                    latest_npm = requests.get(f"https://registry.npmjs.org/@gradio/{js_component}/latest").json()["version"]
                    latest_npm = f" [v{latest_npm}](https://www.npmjs.com/package/@gradio/{js_component})"
                    readme_content = readme_content.split("\n")
                    readme_content = "\n".join([readme_content[0], latest_npm, *readme_content[1:]])
                except TypeError:
                    pass

                js[js_component] = readme_content
                js_pages.append(js_component)


    with open(JS_CLIENT_README) as f:
        readme_content = f.read()
    js_pages.append("js-client")

    js["js-client"] = readme_content

    js_pages.sort()


    return {"docs": organized, "pages": pages, "js": js, "js_pages": js_pages, "js_client": readme_content}


docs = organize_docs(docs)

def generate(json_path):
    with open(json_path, "w+") as f:
        json.dump(docs, f)
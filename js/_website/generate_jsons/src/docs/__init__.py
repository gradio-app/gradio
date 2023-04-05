import json
import os
from gradio.documentation import generate_documentation, document_cls
from gradio.events import EventListener
from ..guides import guides

DIR = os.path.dirname(__file__)
GRADIO_DIR = "../../../"
DEMOS_DIR = os.path.join(GRADIO_DIR, "demo")

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

ordered_events = ["Change()", "Click()", "Submit()", "Edit()", "Clear()", "Play()", "Pause()", "Stream()", "Blur()", "Upload()"]

def add_supported_events():
    for component in docs["component"]:
        component["events_list"] = []
        event_listener_props = dir(EventListener)
        for listener in EventListener.__subclasses__():
            if not issubclass(component["class"], listener):
                continue
            for prop in dir(listener):
                if prop not in event_listener_props:
                    component["events_list"].append(prop + "()")
        if component["events_list"]:
            component["events"] = ", ".join(component["events_list"])


add_supported_events()


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
override_signature("Box", "with gradio.Box():")
override_signature("Dataset", "gr.Dataset(components, samples)")


def find_cls(target_cls):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == target_cls:
                return cls
    raise ValueError("Class not found")


def organize_docs(d):
    organized = {"building": {}, 
                 "components": {}, 
                 "helpers": {}, 
                 "routes": {}, 
                 "events": {}}
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
            elif mode in ["helpers", "routes"]:
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
            organized["components"][cls]["next_obj"] =  organized["components"][c_keys[1]]["name"]
        elif i == len(c_keys) - 1:
            organized["components"][cls]["prev_obj"] = organized["components"][c_keys[len(c_keys) - 2]]["name"]
            organized["components"][cls]["next_obj"] = "Examples"
        else:
            organized["components"][cls]["prev_obj"] = organized["components"][c_keys[i-1]]["name"]
            organized["components"][cls]["next_obj"] = organized["components"][c_keys[i+1]]["name"]
    c_keys = list(organized["helpers"].keys())
    for i, cls in enumerate(organized["helpers"]):
        if not i: 
            organized["helpers"][cls]["prev_obj"] = "Video"
            organized["helpers"][cls]["next_obj"] =  organized["helpers"][c_keys[1]]["name"]
        elif i == len(c_keys) - 1:
            organized["helpers"][cls]["prev_obj"] = organized["helpers"][c_keys[len(c_keys) - 2]]["name"]
            organized["helpers"][cls]["next_obj"] = "Request"
        else:
            organized["helpers"][cls]["prev_obj"] = organized["helpers"][c_keys[i-1]]["name"]
            organized["helpers"][cls]["next_obj"] = organized["helpers"][c_keys[i+1]]["name"]
    c_keys = list(organized["routes"].keys())
    for i, cls in enumerate(organized["routes"]):
        if not i: 
            organized["routes"][cls]["prev_obj"] = "make_waveform"
            organized["routes"][cls]["next_obj"] =  organized["routes"][c_keys[1]]["name"]
        elif i == len(c_keys) - 1:
            organized["routes"][cls]["prev_obj"] = organized["routes"][c_keys[len(c_keys) - 2]]["name"]
        else:
            organized["routes"][cls]["prev_obj"] = organized["routes"][c_keys[i-1]]["name"]
            organized["routes"][cls]["next_obj"] = organized["routes"][c_keys[i+1]]["name"]

    organized["ordered_events"] = ordered_events
    return {"docs": organized, "pages": pages}

docs = organize_docs(docs)
    
def generate(json_path):    
    with open(json_path, "w+") as f:
        json.dump(docs, f)
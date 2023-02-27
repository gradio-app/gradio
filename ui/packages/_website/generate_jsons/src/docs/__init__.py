import json
import os
from gradio.documentation import generate_documentation, document_cls
from gradio.events import EventListener
from ..guides import guides

DIR = os.path.dirname(__file__)
GRADIO_DIR = "../../../../"
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
        component["events-list"] = []
        event_listener_props = dir(EventListener)
        for listener in EventListener.__subclasses__():
            if not issubclass(component["class"], listener):
                continue
            for prop in dir(listener):
                if prop not in event_listener_props:
                    component["events-list"].append(prop + "()")
        if component["events-list"]:
            component["events"] = ", ".join(component["events-list"])


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
                cls["tags"][tag] = (
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


def build_page(obj, prev_obj, next_obj, is_component):

    output = {
            "obj": obj,
            "is_class": True,
            "parent": "gradio",
            "is_component": is_component,
            "prev_obj": prev_obj,
            "next_obj": next_obj,
            "ordered_events": ordered_events,
    }
    return output
    
    
def generate(json_path):
        flagging_obj = {
            "name": "Flagging",
            "description": """A Gradio Interface includes a 'Flag' button that appears
                underneath the output. By default, clicking on the Flag button sends the input and output
                data back to the machine where the gradio demo is running, and saves it to a CSV log file.
                But this default behavior can be changed. To set what happens when the Flag button is clicked,
                you pass an instance of a subclass of <em>FlaggingCallback</em> to the <em>flagging_callback</em> parameter
                in the <em>Interface</em> constructor. You can use one of the <em>FlaggingCallback</em> subclasses
                that are listed below, or you can create your own, which lets you do whatever
                you want with the data that is being flagged.""",
        }
        combining_interfaces_obj = {
            "name": "Combining-Interfaces",
            "description": """Once you have created several Interfaces, we provide several classes that let you
                start combining them together. For example, you can chain them in <em>Series</em>
                or compare their outputs in <em>Parallel</em> if the inputs and outputs match accordingly.
                You can also display arbitrary Interfaces together in a tabbed layout using <em>TabbedInterface</em>."""
        }
        block_layouts_obj = {
            "name": "Block-Layouts",
            "description": """Customize the layout of your Blocks UI with the layout classes below."""
        }

        documented_obj = [(find_cls("Interface"), False), (flagging_obj, False), (combining_interfaces_obj, False), (find_cls("Blocks"), False), (block_layouts_obj, False)]
        documented_obj.extend([(c, True) for c in docs["component"]])
        documented_obj.extend([(c, False) for c in docs["helpers"]])
        documented_obj.extend([(c, False) for c in docs["routes"]])

        for obj in documented_obj:
            obj[0]["class"] = None
            if "returns" in obj[0]:
            obj[0]["returns"]["annotation"] = None
            for p in obj[0].get("parameters", []):
                p["annotation"] = str(p["annotation"])
            for f in obj[0].get("fns", []):
                f["fn"] = None
                for p in f.get("parameters", []):
                    p["annotation"] = str(p["annotation"])
    

        docs_obj = {}

        for index, obj in enumerate(documented_obj):
            if index == 0: 
                prev_obj, next_obj = None, documented_obj[1][0]
            elif index == len(documented_obj) - 1:
                prev_obj, next_obj = documented_obj[-2][0], None
            else: 
                prev_obj, next_obj = documented_obj[index-1][0], documented_obj[index+1][0]
            docs_obj[obj[0]["name"].lower()] = build_page(obj=obj[0], prev_obj=prev_obj, next_obj=next_obj, is_component=obj[1])
        
        
        with open(json_path, "w+") as f:
            json.dump(docs_obj, f)

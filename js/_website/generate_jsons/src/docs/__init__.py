import html
import json
import os
import re
import requests
import base64
import urllib.parse



from gradio_client.documentation import document_cls, generate_documentation
import gradio
from ..guides import guides, guide_names

DIR = os.path.dirname(__file__)
DEMOS_DIR = os.path.abspath(os.path.join(DIR, "../../../../../demo"))
JS_CLIENT_README = os.path.abspath(os.path.join(DIR, "../../../../../client/js/README.md"))
JS_DIR = os.path.abspath(os.path.join(DIR, "../../../../../js/"))
TEMPLATES_DIR = os.path.abspath(os.path.join(DIR, "../../../src/lib/templates"))

docs = generate_documentation()

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
                    demo_code = demo_code.replace("# type: ignore", "")
                cls["demos"].append((demo, demo_code))


add_demos()

def create_events_matrix():
    events = set({})
    component_events = {}
    for component in docs["component"]:
        component_event_list = []
        if hasattr(component["class"], 'EVENTS'):
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


def generate_playground_link(demo_name):
    playground_url = "https://gradio.app/playground?demo=Blank"
    with open(os.path.join(DEMOS_DIR, demo_name, "run.py")) as f:
        demo_code = f.read()
        encoded_code = base64.b64encode(demo_code.encode('utf-8')).decode('utf-8')
        encoded_code_url = urllib.parse.quote(encoded_code, safe='')
        playground_url += "&code=" + encoded_code_url
    if "requirements.txt" in os.listdir(os.path.join(DEMOS_DIR, demo_name)):
        with open(os.path.join(DEMOS_DIR, demo_name, "requirements.txt")) as f:
            requirements = f.read()
            if requirements:
                encoded_reqs = base64.b64encode(requirements.encode('utf-8')).decode('utf-8')
                encoded_reqs_url = urllib.parse.quote(encoded_reqs, safe='')
                playground_url += "&reqs=" + encoded_reqs_url
    return f"[demo/{demo_name}]({playground_url})"


def escape_parameters(parameters):
    new_parameters = []
    for param in parameters:
        param = param.copy()  # Manipulating the list item directly causes issues, so copy it first
        param["doc"] = html.escape(param["doc"]) if param["doc"] else param["doc"]
        if param["doc"] and "$demo/" in param["doc"]:
            param["doc"] = re.sub(
                    r"\$demo/(\w+)",
                    lambda m: generate_playground_link(m.group(1)),
                    param["doc"],
                )
        new_parameters.append(param)
    assert len(new_parameters) == len(parameters)
    return new_parameters


def escape_html_string_fields():
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
                cls["tags"][tag] = html.escape(cls["tags"][tag])

            cls["parameters"] = escape_parameters(cls["parameters"])
            for fn in cls["fns"]:
                fn["description"] = html.escape(fn["description"])
                fn["parameters"] = escape_parameters(fn["parameters"])

escape_html_string_fields()

def find_cls(target_cls):
    for mode in docs:
        for cls in docs[mode]:
            if cls["name"] == target_cls:
                return cls
    raise ValueError("Class not found")


def organize_docs(d):
    organized = {
        "gradio": {
            "building": {},
            "components": {},
            "helpers": {},
            "modals": {},
            "routes": {},
            "events": {},
            "chatinterface": {}
        },
        "python-client": {}
    }
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
                organized["gradio"]["components"][c["name"].lower()] = c
            elif mode == "py-client":
                organized["python-client"][c["name"].lower()] = c
            elif mode in ["helpers", "routes", "chatinterface", "modals"]:
                organized["gradio"][mode][c["name"].lower()] = c                
            else:
                organized["gradio"]["building"][c["name"].lower()] = c
    

    def format_name(page_name):
        index = None
        page_path = page_name
        if re.match("^[0-9]+_", page_name):
            index = int(page_name[: page_name.index("_")])
            page_name = page_name[page_name.index("_") + 1 :]
        if page_name.lower().endswith(".svx"):
            page_name = page_name[:-4]
        pretty_page_name = " ".join([word[0].upper() + word[1:] for word in page_name.split("-")])
        for library in organized:
            for category in organized[library]:
                if page_name in organized[library][category]:
                    return index, page_name, organized[library][category][page_name]["name"], page_path
        if page_name == "chatinterface": 
            pretty_page_name =  "ChatInterface"              
        return index, page_name, pretty_page_name, page_path
    
    
    def organize_pages(): 
        pages = {"gradio": [], "python-client": [], "third-party-clients": []}
        absolute_index = -1;
        for library in pages:
            library_templates_dir = os.path.join(TEMPLATES_DIR, library)
            page_folders = sorted(os.listdir(library_templates_dir))
            for page_folder in page_folders:
                page_list = sorted(os.listdir(os.path.join(library_templates_dir, page_folder)))
                _, page_category, pretty_page_category, category_path = format_name(page_folder)
                category_path = os.path.join(library, category_path)
                pages[library].append({"category": pretty_page_category, "pages": []})
                for page_file in page_list:
                    page_index, page_name, pretty_page_name, page_path = format_name(page_file)
                    pages[library][-1]["pages"].append({"name": page_name, "pretty_name": pretty_page_name, "path": os.path.join(category_path, page_path), "page_index": page_index, "abolute_index": absolute_index + 1})
        return pages

    pages = organize_pages()

    organized["gradio"]["events_matrix"] = component_events
    organized["gradio"]["events"] = events

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

gradio_docs = docs["docs"]["gradio"]

SYSTEM_PROMPT = ""

FALLBACK_PROMPT = SYSTEM_PROMPT

FALLBACK_PROMPT += "Below are all the class and function signatures in the Gradio library: (these are what you will reference as docs)\n\n"

for key in gradio_docs:
    if key in ["events", "events_matrix"]:
        continue
    if "name" in key:
        o = gradio_docs[key]
        signature = f"""{o['name']}({', '.join([
            p['name'] + 
            ': ' + p['annotation']
            + (' = ' + p['default'] if 'default' in p else '')
            for p in o['parameters']])})"""
        FALLBACK_PROMPT += f"{signature}\n"
        FALLBACK_PROMPT += f"{o['description']}\n\n"

    else: 
        for c in gradio_docs[key]:
            o = gradio_docs[key][c]
            signature = f"""{o['name']}({', '.join([
                p['name'] + 
                ': ' + p['annotation']
                + (' = ' + p['default'] if 'default' in p else '')
                for p in o['parameters']])})"""          
            FALLBACK_PROMPT += f"{signature}\n"
            FALLBACK_PROMPT += f"{o['description']}\n\n"
            if "fns" in o and key != "components":
                for f in o["fns"]:
                    signature = f"""{o['name']}.{f['name']}({', '.join([
                        p['name'] + 
                        ': ' + p['annotation']
                        + (' = ' + p['default'] if 'default' in p else '')
                        for p in f['parameters']])})"""
                    FALLBACK_PROMPT += f"{signature}\n"
                    FALLBACK_PROMPT += f"{f['description']}\n\n"

FALLBACK_PROMPT += "\nEvent listeners allow Gradio to respond to user interactions with the UI components defined in a Blocks app. When a user interacts with an element, such as changing a slider value or uploading an image, a function is called.\n"

FALLBACK_PROMPT += "All event listeners have the same signature:\n"

f = gradio_docs["components"]["audio"]["fns"][0]
signature = f"""<component_name>.<event_name>({', '.join([
                        p['name'] + 
                        ': ' + p['annotation']
                        + (' = ' + p['default'] if 'default' in p else '')
                        for p in f['parameters']])})"""
FALLBACK_PROMPT += signature
FALLBACK_PROMPT += "\nEach component only supports some specific events. Below is a list of all gradio components and every event that each component supports. If an event is supported by a component, it is a valid method of the component."
for component in gradio_docs["events_matrix"]:
    FALLBACK_PROMPT += f"{component}: {', '.join(gradio_docs['events_matrix'][component])}\n\n"

SYSTEM_PROMPT += "Below are examples of full end-to-end Gradio apps:\n\n"
FALLBACK_PROMPT += "Below are examples of full end-to-end Gradio apps:\n\n"


# 'audio_component_events', 'audio_mixer', 'blocks_essay', 'blocks_chained_events', 'blocks_xray', 'chatbot_multimodal', 'sentence_builder', 'custom_css', 'blocks_update', 'fake_gan'
# important_demos = ["annotatedimage_component", "blocks_essay_simple", "blocks_flipper", "blocks_form", "blocks_hello", "blocks_js_load", "blocks_js_methods", "blocks_kinematics", "blocks_layout", "blocks_plug", "blocks_simple_squares", "calculator", "chatbot_consecutive", "chatbot_simple", "chatbot_streaming", "chatinterface_multimodal", "datetimes", "diff_texts", "dropdown_key_up", "fake_diffusion", "fake_gan", "filter_records", "function_values", "gallery_component_events", "generate_tone", "hangman", "hello_blocks", "hello_blocks_decorator", "hello_world", "image_editor", "matrix_transpose", "model3D", "on_listener_decorator", "plot_component", "render_merge", "render_split", "reverse_audio_2", "sales_projections", "sepia_filter", "sort_records", "streaming_simple", "tabbed_interface_lite", "tax_calculator", "theme_soft", "timer", "timer_simple", "variable_outputs", "video_identity"]
important_demos = ['custom_css', "annotatedimage_component", "blocks_essay_simple", "blocks_flipper", "blocks_form", "blocks_hello", "blocks_js_load", "blocks_js_methods", "blocks_kinematics", "blocks_layout", "blocks_plug", "blocks_simple_squares", "calculator", "chatbot_consecutive", "chatbot_simple", "chatbot_streaming", "datetimes", "diff_texts", "dropdown_key_up", "fake_diffusion", "filter_records", "function_values", "gallery_component_events", "generate_tone", "hangman", "hello_blocks", "hello_blocks_decorator", "hello_world", "image_editor", "matrix_transpose", "model3D", "on_listener_decorator", "plot_component", "render_merge", "render_split", "reverse_audio_2", "sepia_filter", "sort_records", "streaming_simple", "tabbed_interface_lite", "tax_calculator", "theme_soft", "timer", "timer_simple", "variable_outputs", "video_identity"]
very_important_demos = ["blocks_essay_simple", "blocks_flipper", "blocks_form", "blocks_hello","reverse_audio_2", "sepia_filter", "sort_records", "streaming_simple", "tabbed_interface_lite", "tax_calculator", "timer_simple", "video_identity"]

def length(demo):
    if os.path.exists(os.path.join(DEMOS_DIR, demo, "run.py")):
        demo_file = os.path.join(DEMOS_DIR, demo, "run.py")
    else: 
        return 0
    with open(demo_file) as run_py:
        demo_code = run_py.read()
        demo_code = demo_code.replace("# type: ignore", "").replace('if __name__ == "__main__":\n    ', "")
    return len(demo_code)

# important_demos = sorted(important_demos, key=length, reverse=True)
# print(important_demos)

for demo in important_demos:
    if os.path.exists(os.path.join(DEMOS_DIR, demo, "run.py")):
        demo_file = os.path.join(DEMOS_DIR, demo, "run.py")
    else: 
        continue
    with open(demo_file) as run_py:
        demo_code = run_py.read()
        demo_code = demo_code.replace("# type: ignore", "").replace('if __name__ == "__main__":\n    ', "")
    FALLBACK_PROMPT += f"Name: {demo.replace('_', ' ')}\n"
    FALLBACK_PROMPT += "Code: \n\n"
    FALLBACK_PROMPT += f"{demo_code}\n\n"

for demo in very_important_demos:
    if os.path.exists(os.path.join(DEMOS_DIR, demo, "run.py")):
        demo_file = os.path.join(DEMOS_DIR, demo, "run.py")
    else: 
        continue
    with open(demo_file) as run_py:
        demo_code = run_py.read()
        demo_code = demo_code.replace("# type: ignore", "").replace('if __name__ == "__main__":\n    ', "")
    SYSTEM_PROMPT += f"Name: {demo.replace('_', ' ')}\n"
    SYSTEM_PROMPT += "Code: \n\n"
    SYSTEM_PROMPT += f"{demo_code}\n\n"

FALLBACK_PROMPT += """
The latest verstion of Gradio includes some breaking changes, and important new features you should be aware of. Here is a list of the important changes:

1. Audio files are no longer converted to .wav automatically

Previously, the default value of the format in the gr.Audio component was wav, meaning that audio files would be converted to the .wav format before being processed by a prediction function or being returned to the user. Now, the default value of format is None, which means any audio files that have an existing format are kept as is. 

2. The 'every' parameter is no longer supported in event listeners

Previously, if you wanted to run an event 'every' X seconds after a certain trigger, you could set `every=` in the event listener. This is no longer supported — do the following instead:

- create a `gr.Timer` component, and
- use the `.tick()` method to trigger the event.

E.g., replace something like this:

with gr.Blocks() as demo:
    a = gr.Textbox()
    b = gr.Textbox()
    btn = gr.Button("Start")
    btn.click(lambda x:x, a, b, every=1)

with this:

with gr.Blocks() as demo:
    a = gr.Textbox()
    b = gr.Textbox()
    btn = gr.Button("Start")
    t = gr.Timer(1, active=False)
    t.tick(lambda x:x, a, b)
    btn.click(lambda: gr.Timer(active=True), None, t)

This makes it easy to configure the timer as well to change its frequency or stop the event, e.g.

# some code...
stop_btn = gr.Button("Stop")
    stop_btn.click(lambda: gr.Timer(active=False), None, t) # deactivates timer
fast_btn = gr.Button("Fast")
    fast_btn.click(lambda: gr.Timer(0.1), None, t) # makes timer tick every 0.1s


3. The `undo_btn`, `retry_btn` and `clear_btn` parameters of `ChatInterface` have been removed
4. Passing a tuple to `gr.Code` is not supported
5. The `concurrency_count` parameter has been removed from `.queue()`
6. The `additional_inputs_accordion_name` parameter has been removed from `gr.ChatInterface`
7. The `thumbnail` parameter has been removed from `gr.Interface`
8. The `root` parameter in `gr.FileExplorer` has been removed 
9. The `signed_in_value` parameter in `gr.LoginButton` has been removed
10. The `gr.LogoutButton` component has been removed
11. The `gr.make_waveform` method has been removed from the library
12. SVGs are not accepted as input images into the `gr.Image` component unless `type=filepath` 
13. The `height` parameter in `gr.DataFrame` has been renamed to `max_height` 
14. The `likeable` parameter of `gr.Chatbot` has been removed. The chatbot will display like buttons whenever the `like` event is defined.
15. By default user messages are not likeable in the `gr.Chatbot`. To display like buttons in the user message, set the `user_like_button` parameter of the `like` event to True.
16. The argument for lazy-caching examples has been changed

Previously, to lazy-cache examples, you would pass in “lazy” to the `cache_examples` parameter in `Interface`, `Chatinterface` , or `Examples`. Now, there is a separate `cache_mode` parameter, which governs whether caching should be `"lazy"` or `"eager"` . So if your code was previously:

Now, your code should look like this:

chatbot = gr.ChatInterface(
    double,
    examples=["hello", "hi"],
    cache_examples=True,
    cache_mode="lazy",
)

"""

SYSTEM_PROMPT += "\n\n$INSERT_GUIDES_DOCS_DEMOS"


# print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")
# print(SYSTEM_PROMPT)
# print("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")



def generate(json_path):
    with open(json_path, "w+") as f:
        json.dump(docs, f)
    return  SYSTEM_PROMPT, FALLBACK_PROMPT
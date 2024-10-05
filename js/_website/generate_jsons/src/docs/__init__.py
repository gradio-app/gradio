import html
import json
import os
import re
import requests


from gradio_client.documentation import document_cls, generate_documentation
import gradio
from ..guides import guides

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


def escape_parameters(parameters):
    new_parameters = []
    for param in parameters:
        param = param.copy()  # Manipulating the list item directly causes issues, so copy it first
        param["doc"] = html.escape(param["doc"]) if param["doc"] else param["doc"]
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

SYSTEM_PROMPT = """
Generate code for using the Gradio python library. 

The following RULES must be followed.  Whenever you are forming a response, ensure all rules have been followed otherwise start over.

RULES: 
Only respond with code, not text.
Only respond with valid Python syntax.
Never include backticks in your response such as ``` or ```python. 
Never use any external library aside from: gradio, numpy, pandas, plotly, transformers_js and matplotlib.
Do not include any code that is not necessary for the app to run.
Respond with a full Gradio app. 
Respond with a full Gradio app using correct syntax and features of the latest Gradio version. DO NOT write code that doesn't follow the signatures listed.
Add comments explaining the code, but do not include any text that is not formatted as a Python comment.



Here's an example of a valid response:

# This is a simple Gradio app that greets the user.
import gradio as gr

# Define a function that takes a name and returns a greeting.
def greet(name):
    return "Hello " + name + "!"

# Create a Gradio interface that takes a textbox input, runs it through the greet function, and returns output to a textbox.`
demo = gr.Interface(fn=greet, inputs="textbox", outputs="textbox")

# Launch the interface.
demo.launch()


Below are all the class and function signatures in the Gradio library.

"""

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
        SYSTEM_PROMPT += f"{signature}\n"
        SYSTEM_PROMPT += f"{o['description']}\n\n"
    else: 
        for c in gradio_docs[key]:
            o = gradio_docs[key][c]
            signature = f"""{o['name']}({', '.join([
                p['name'] + 
                ': ' + p['annotation']
                + (' = ' + p['default'] if 'default' in p else '')
                for p in o['parameters']])})"""          
            SYSTEM_PROMPT += f"{signature}\n"
            SYSTEM_PROMPT += f"{o['description']}\n\n"
            if "fns" in o and key != "components":
                for f in o["fns"]:
                    signature = f"""{o['name']}.{f['name']}({', '.join([
                        p['name'] + 
                        ': ' + p['annotation']
                        + (' = ' + p['default'] if 'default' in p else '')
                        for p in f['parameters']])})"""
                    SYSTEM_PROMPT += f"{signature}\n"
                    SYSTEM_PROMPT += f"{f['description']}\n\n"

SYSTEM_PROMPT += "\nEvent listeners allow Gradio to respond to user interactions with the UI components defined in a Blocks app. When a user interacts with an element, such as changing a slider value or uploading an image, a function is called.\n"

SYSTEM_PROMPT += "All event listeners have the same signature:\n"

f = gradio_docs["components"]["audio"]["fns"][0]
signature = f"""<component_name>.<event_name>({', '.join([
                        p['name'] + 
                        ': ' + p['annotation']
                        + (' = ' + p['default'] if 'default' in p else '')
                        for p in f['parameters']])})"""
SYSTEM_PROMPT += signature
SYSTEM_PROMPT += "\nEach component only supports some specific events. Below is a list of all gradio components and every event that each component supports. If an event is supported by a component, it is a valid method of the component."
for component in gradio_docs["events_matrix"]:
    SYSTEM_PROMPT += f"{component}: {', '.join(gradio_docs['events_matrix'][component])}\n\n"


SYSTEM_PROMPT += "Below are examples of full end-to-end Gradio apps:\n\n"

# 'audio_component_events', 'audio_mixer', 'blocks_essay', 'blocks_chained_events', 'blocks_xray', 'chatbot_multimodal', 'sentence_builder', 'custom_css', 'blocks_update', 'fake_gan'
# important_demos = ["annotatedimage_component", "blocks_essay_simple", "blocks_flipper", "blocks_form", "blocks_hello", "blocks_js_load", "blocks_js_methods", "blocks_kinematics", "blocks_layout", "blocks_plug", "blocks_simple_squares", "calculator", "chatbot_consecutive", "chatbot_simple", "chatbot_streaming", "chatinterface_multimodal", "datetimes", "diff_texts", "dropdown_key_up", "fake_diffusion", "fake_gan", "filter_records", "function_values", "gallery_component_events", "generate_tone", "hangman", "hello_blocks", "hello_blocks_decorator", "hello_world", "image_editor", "matrix_transpose", "model3D", "on_listener_decorator", "plot_component", "render_merge", "render_split", "reverse_audio_2", "sales_projections", "sepia_filter", "sort_records", "streaming_simple", "tabbed_interface_lite", "tax_calculator", "theme_soft", "timer", "timer_simple", "variable_outputs", "video_identity"]
important_demos = ['custom_css', "annotatedimage_component", "blocks_essay_simple", "blocks_flipper", "blocks_form", "blocks_hello", "blocks_js_load", "blocks_js_methods", "blocks_kinematics", "blocks_layout", "blocks_plug", "blocks_simple_squares", "calculator", "chatbot_consecutive", "chatbot_simple", "chatbot_streaming", "chatinterface_multimodal", "datetimes", "diff_texts", "dropdown_key_up", "fake_diffusion", "filter_records", "function_values", "gallery_component_events", "generate_tone", "hangman", "hello_blocks", "hello_blocks_decorator", "hello_world", "image_editor", "matrix_transpose", "model3D", "on_listener_decorator", "plot_component", "render_merge", "render_split", "reverse_audio_2", "sales_projections", "sepia_filter", "sort_records", "streaming_simple", "tabbed_interface_lite", "tax_calculator", "theme_soft", "timer", "timer_simple", "variable_outputs", "video_identity"]


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
    SYSTEM_PROMPT += f"Name: {demo.replace('_', ' ')}\n"
    SYSTEM_PROMPT += "Code: \n\n"
    SYSTEM_PROMPT += f"{demo_code}\n\n"


SYSTEM_PROMPT += """
The latest verstion of Gradio includes some breaking changes, and important new features you should be aware of. Here is a list of the important changes:

1. Streaming audio, images, and video as input and output are now fully supported in Gradio. 

Streaming Outputs:

In some cases, you may want to stream a sequence of outputs rather than show a single output at once. For example, you might have an image generation model and you want to show the image that is generated at each step, leading up to the final image. Or you might have a chatbot which streams its response one token at a time instead of returning it all at once.
In such cases, you can supply a generator function into Gradio instead of a regular function. 
Here's an example of a Gradio app that streams a sequence of images:

CODE: 

import gradio as gr
import numpy as np
import time

def fake_diffusion(steps):
    rng = np.random.default_rng()
    for i in range(steps):
        time.sleep(1)
        image = rng.random(size=(600, 600, 3))
        yield image
    image = np.ones((1000,1000,3), np.uint8)
    image[:] = [255, 124, 0]
    yield image

demo = gr.Interface(fake_diffusion,
                    inputs=gr.Slider(1, 10, 3, step=1),
                    outputs="image")

demo.launch()



Gradio can stream audio and video directly from your generator function. This lets your user hear your audio or see your video nearly as soon as it's yielded by your function. All you have to do is

Set streaming=True in your gr.Audio or gr.Video output component.
Write a python generator that yields the next "chunk" of audio or video.
Set autoplay=True so that the media starts playing automatically.

For audio, the next "chunk" can be either an .mp3 or .wav file or a bytes sequence of audio. For video, the next "chunk" has to be either .mp4 file or a file with h.264 codec with a .ts extension. For smooth playback, make sure chunks are consistent lengths and larger than 1 second.

Here's an example gradio app that streams audio:

CODE: 

import gradio as gr
from time import sleep

def keep_repeating(audio_file):
    for _ in range(10):
        sleep(0.5)
        yield audio_file

gr.Interface(keep_repeating,
            gr.Audio(sources=["microphone"], type="filepath"),
            gr.Audio(streaming=True, autoplay=True)
).launch()


Here's an example gradio app that streams video:

CODE: 

import gradio as gr
from time import sleep

def keep_repeating(video_file):
    for _ in range(10):
        sleep(0.5)
        yield video_file

gr.Interface(keep_repeating,
             gr.Video(sources=["webcam"], format="mp4"),
             gr.Video(streaming=True, autoplay=True)
).launch()

Streaming Inputs:

Gradio also allows you to stream images from a user's camera or audio chunks from their microphone into your event handler. This can be used to create real-time object detection apps or conversational chat applications with Gradio.

Currently, the gr.Image and the gr.Audio components support input streaming via the stream event. 

Here's an example, which simply returns the webcam stream unmodified:

CODE: 

import gradio as gr
import numpy as np
import cv2

def transform_cv2(frame, transform):
    if transform == "cartoon":
        # prepare color
        img_color = cv2.pyrDown(cv2.pyrDown(frame))
        for _ in range(6):
            img_color = cv2.bilateralFilter(img_color, 9, 9, 7)
        img_color = cv2.pyrUp(cv2.pyrUp(img_color))

        # prepare edges
        img_edges = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        img_edges = cv2.adaptiveThreshold(
            cv2.medianBlur(img_edges, 7),
            255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY,
            9,
            2,
        )
        img_edges = cv2.cvtColor(img_edges, cv2.COLOR_GRAY2RGB)
        # combine color and edges
        img = cv2.bitwise_and(img_color, img_edges)
        return img
    elif transform == "edges":
        # perform edge detection
        img = cv2.cvtColor(cv2.Canny(frame, 100, 200), cv2.COLOR_GRAY2BGR)
        return img
    else:
        return np.flipud(frame)


css=".my-group {max-width: 500px !important; max-height: 500px !important;}\n.my-column {display: flex !important; justify-content: center !important; align-items: center !important};"

with gr.Blocks(css=css) as demo:
    with gr.Column(elem_classes=["my-column"]):
        with gr.Group(elem_classes=["my-group"]):
            transform = gr.Dropdown(choices=["cartoon", "edges", "flip"],
                                    value="flip", label="Transformation")
            input_img = gr.Image(sources=["webcam"], type="numpy")
    input_img.stream(transform_cv2, [input_img, transform], [input_img], time_limit=30, stream_every=0.1)


demo.launch()



There are two unique keyword arguments for the stream event:

time_limit - This is the amount of time the gradio server will spend processing the event. Media streams are naturally unbounded so it's important to set a time limit so that one user does not hog the Gradio queue. The time limit only counts the time spent processing the stream, not the time spent waiting in the queue. The orange bar displayed at the bottom of the input image represents the remaining time. When the time limit expires, the user will automatically rejoin the queue.

stream_every - This is the frequency (in seconds) with which the stream will capture input and send it to the server. For demos like image detection or manipulation, setting a smaller value is desired to get a "real-time" effect. For demos like speech transcription, a higher value is useful so that the transcription algorithm has more context of what's being said.



Your streaming function should be stateless. It should take the current input and return its corresponding output. However, there are cases where you may want to keep track of past inputs or outputs. For example, you may want to keep a buffer of the previous k inputs to improve the accuracy of your transcription demo. You can do this with Gradio's gr.State() component.

Let's showcase this with a sample demo:

CODE:

def transcribe_handler(current_audio, state, transcript):
    next_text = transcribe(current_audio, history=state)
    state.append(current_audio)
    state = state[-3:]
    return state, transcript + next_text

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            mic = gr.Audio(sources="microphone")
            state = gr.State(value=[])
        with gr.Column():
            transcript = gr.Textbox(label="Transcript")
    mic.stream(transcribe_handler, [mic, state, transcript], [state, transcript],
               time_limit=10, stream_every=1)


demo.launch()


2. Audio files are no longer converted to .wav automatically

Previously, the default value of the format in the gr.Audio component was wav, meaning that audio files would be converted to the .wav format before being processed by a prediction function or being returned to the user. Now, the default value of format is None, which means any audio files that have an existing format are kept as is. 

3. The 'every' parameter is no longer supported in event listeners

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


4. The `undo_btn`, `retry_btn` and `clear_btn` parameters of `ChatInterface` have been removed
5. Passing a tuple to `gr.Code` is not supported
6. The `concurrency_count` parameter has been removed from `.queue()`
7. The `additional_inputs_accordion_name` parameter has been removed from `gr.ChatInterface`
8. The `thumbnail` parameter has been removed from `gr.Interface`
9. The `root` parameter in `gr.FileExplorer` has been removed 
10. The `signed_in_value` parameter in `gr.LoginButton` has been removed
11. The `gr.LogoutButton` component has been removed
12. The `gr.make_waveform` method has been removed from the library
13. SVGs are not accepted as input images into the `gr.Image` component unless `type=filepath` 
14. The `height` parameter in `gr.DataFrame` has been renamed to `max_height` 
15. The `likeable` parameter of `gr.Chatbot` has been removed. The chatbot will display like buttons whenever the `like` event is defined.
16. By default user messages are not likeable in the `gr.Chatbot`. To display like buttons in the user message, set the `user_like_button` parameter of the `like` event to True.
17. The argument for lazy-caching examples has been changed

Previously, to lazy-cache examples, you would pass in “lazy” to the `cache_examples` parameter in `Interface`, `Chatinterface` , or `Examples`. Now, there is a separate `cache_mode` parameter, which governs whether caching should be `"lazy"` or `"eager"` . So if your code was previously:

Now, your code should look like this:

chatbot = gr.ChatInterface(
    double,
    examples=["hello", "hi"],
    cache_examples=True,
    cache_mode="lazy",
)

"""


SYSTEM_PROMPT += """

The following RULES must be followed.  Whenever you are forming a response, after each sentence ensure all rules have been followed otherwise start over, forming a new response and repeat until the finished response follows all the rules.  then send the response.

RULES: 
Only respond with code, not text.
Only respond with valid Python syntax.
Never include backticks in your response such as ``` or ```python. 
Never import any external library aside from: gradio, numpy, pandas, plotly, transformers_js and matplotlib. Do not import any other library like pytesseract or PIL unless requested in the prompt. 
Do not include any code that is not necessary for the app to run.
Respond with a full Gradio app using correct syntax and features of the latest Gradio version. DO NOT write code that doesn't follow the signatures listed.
Only respond with one full Gradio app.
Add comments explaining the code, but do not include any text that is not formatted as a Python comment.
"""

def generate(json_path):
    with open(json_path, "w+") as f:
        json.dump(docs, f)
    return  SYSTEM_PROMPT
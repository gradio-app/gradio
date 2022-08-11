import json
import os
import re
import subprocess
import sys
import pathlib

from jinja2 import Template
from gradio.documentation import generate_documentation

GRADIO_DIR = os.path.join(os.getcwd(), os.pardir, os.pardir)
GRADIO_DEMO_DIR = os.path.join(GRADIO_DIR, "demo")
GRADIO_GUIDES_DIR = os.path.join(GRADIO_DIR, "guides")
sys.path.insert(0, GRADIO_DEMO_DIR)
port = 7860

demos_to_run = []
for root, _, files in os.walk(pathlib.Path(GRADIO_DIR) / "gradio"):
    for filename in files:
        source_file = pathlib.Path(root) / filename
        if source_file.suffix != ".py":
            continue
        with open(source_file, "r") as comp_file:
            comp_text = comp_file.read()
        for demostr in re.findall(r"Demos:(.*)", comp_text):
            demos_to_run += re.findall(r"([a-zA-Z0-9_]+)", demostr)

recipe_demos = [
    {"name": "Hello World", "dir": "hello_world", "code": None},
    {"name": "Sepia Filter", "dir": "sepia_filter", "code": None},
    {"name": "Sales Projections", "dir": "sales_projections", "code": None},
    {"name": "Calculator", "dir": "calculator", "code": None},
    {"name": "Calculator Live", "dir": "calculator_live", "code": None},
    {"name": "Hello World (Blocks)", "dir": "blocks_hello", "code": None},
    {"name": "Image and Text Flipper", "dir": "blocks_flipper", "code": None},
    {"name": "GPT", "dir": "blocks_gpt", "code": None},
    {"name": "Sentiment Analysis", "dir": "blocks_speech_text_sentiment", "code": None},
    {"name": "Image Classification with Keras", "dir": "image_classifier", "code": None},
    {"name": "Image Classification with Pytorch", "dir": "image_classifier_2", "code": None},
    {"name": "Titanic Survival", "dir": "titanic_survival", "code": None},
    {"name": "Outbreak Forecast", "dir": "outbreak_forecast", "code": None},
    {"name": "GPT-J", "dir": "gpt_j", "code": None},
]

for demo in recipe_demos:
    demo_file = os.path.join(GRADIO_DEMO_DIR, demo["dir"], "run.py")
    with open(demo_file) as run_py:
        demo_code = run_py.read()
    demo["code"] = demo_code
    if demo["dir"] not in demos_to_run:
        demos_to_run.append(demo["dir"])

with open("../homepage/src/recipes/demos.json", "w") as recipe_demos_file:
    json.dump(recipe_demos, recipe_demos_file)

DEMO_PATTERN = r"\$demo_([A-Za-z0-9_]+)"
for guide_folder in os.listdir(GRADIO_GUIDES_DIR):
    guide_folder = os.path.join(GRADIO_GUIDES_DIR, guide_folder)
    if os.path.isfile(guide_folder) or guide_folder.endswith("assets"):
        continue
    for guide_filename in os.listdir(guide_folder):
        guide_filename = os.path.join(guide_folder, guide_filename)
        if not os.path.isfile(guide_filename):
            continue
        with open(guide_filename) as guide_file:
            guide_content = guide_file.read()
        demos_to_run += re.findall(DEMO_PATTERN, guide_content)

for recipe_demo in recipe_demos:
    if recipe_demo["dir"] not in demos_to_run:
        demos_to_run.append(recipe_demo["dir"])

# adding components to be embedded
docs = generate_documentation()
COMPONENT_SUFFIX = "_component"
demos_to_run += [
    f"{component['name']}{COMPONENT_SUFFIX}" for component in docs["component"]
]
demos_to_run = list(set(demos_to_run))


failed_demos = []
demo_port_sets = []
for demo_name in demos_to_run:
    print(f" ----- {demo_name} ----- ")
    if demo_name.endswith(COMPONENT_SUFFIX):
        demo_port_sets.append((demo_name, port))
    else:
        demo_folder = os.path.join(GRADIO_DEMO_DIR, demo_name)
        requirements_file = os.path.join(demo_folder, "requirements.txt")
        if os.path.exists(requirements_file):
            try:
                subprocess.check_call(
                    [sys.executable, "-m", "pip", "install", "-r", requirements_file]
                )
            except:
                failed_demos.append(demo_name)
                continue
        setup_file = os.path.join(demo_folder, "setup.sh")
        if os.path.exists(setup_file):
            try:
                subprocess.check_call(["sh", setup_file])
            except subprocess.CalledProcessError:
                failed_demos.append(demo_name)
                continue
        demo_port_sets.append((demo_name, port))
    port += 1

with open("nginx_template.conf") as nginx_template_conf:
    template = Template(nginx_template_conf.read())
output_nginx_conf = template.render(demo_port_sets=demo_port_sets)
with open("nginx.conf", "w") as nginx_conf:
    nginx_conf.write(output_nginx_conf)
with open("demos.json", "w") as demos_file:
    json.dump(demo_port_sets, demos_file)

print("failed", failed_demos)
print("success", demo_port_sets)

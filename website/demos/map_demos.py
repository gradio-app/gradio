import json
import os
import re
import subprocess
import sys

from jinja2 import Template

GRADIO_DIR = os.path.join(os.getcwd(), os.pardir, os.pardir)
GRADIO_DEMO_DIR = os.path.join(GRADIO_DIR, "demo")
GRADIO_GUIDES_DIR = os.path.join(GRADIO_DIR, "guides")
sys.path.insert(0, GRADIO_DEMO_DIR)
port = 7860

demos_to_run = []
GRADIO_COMPONENTS_FILE = os.path.join(GRADIO_DIR, "gradio", "components.py")
with open(GRADIO_COMPONENTS_FILE) as comp_file:
    comp_text = comp_file.read()
for demostr in re.findall(r'Demos:(.*)', comp_text):
  demos_to_run += re.findall(r'([a-zA-Z0-9_]+)', demostr)
DEMO_PATTERN = r'\$demo_([A-Za-z0-9_]+)'
for guide_filename in os.listdir(GRADIO_GUIDES_DIR):
    if not os.path.isfile(os.path.join(GRADIO_GUIDES_DIR, guide_filename)):
        continue
    with open(os.path.join(GRADIO_GUIDES_DIR, guide_filename)) as guide_file:
        guide_content = guide_file.read()
    demos_to_run += re.findall(DEMO_PATTERN, guide_content)
demos_to_run = list(set(demos_to_run))

failed_demos = []
demo_port_sets = []
for demo_name in demos_to_run:
    print(f" ----- {demo_name} ----- ")
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
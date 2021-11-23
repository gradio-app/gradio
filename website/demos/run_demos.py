import time
import os
import requests
import json
import importlib
import sys

LAUNCH_PERIOD = 30
GRADIO_DEMO_DIR = "../../demo"
sys.path.insert(0, GRADIO_DEMO_DIR)

with open("demos.json") as demos_file:
    demo_port_sets = json.load(demos_file)

for demo_name, port in demo_port_sets:
    demo_folder = os.path.join(GRADIO_DEMO_DIR, demo_name)
    os.chdir(demo_folder)
    demo = importlib.import_module(f"{demo_name}.run")
    demo.iface.server_port = port
    demo.iface.launch(prevent_thread_lock=True)

start_time = time.time()
while True:
    for demo_name, _ in demo_port_sets:
        r = requests.head(f"http://localhost:80/demo/{demo_name}/")
        if r.status_code != 200:
            print(demo_name, "down")
            if time.time() - start_time > LAUNCH_PERIOD:
                raise ValueError(f"{demo_name} is down.")
        else:
            print(demo_name, "up")
    time.sleep(10)
import importlib
import json
import os
import subprocess
import sys
import threading
import time

import requests

LAUNCH_PERIOD = 60
GRADIO_DEMO_DIR = "../../demo"
sys.path.insert(0, GRADIO_DEMO_DIR)

with open("demos.json") as demos_file:
    demo_port_sets = json.load(demos_file)


def launch_demo(demo_folder):
    subprocess.call(f"cd {demo_folder} && python run.py", shell=True)


for demo_name, port in demo_port_sets:
    demo_folder = os.path.join(GRADIO_DEMO_DIR, demo_name)
    demo_file = os.path.join(demo_folder, "run.py")
    with open(demo_file, "r") as file:
        filedata = file.read()
    assert "demo.launch()" in filedata, demo_name + " has no demo.launch()"
    filedata = filedata.replace(f"demo.launch()", f"demo.launch(server_port={port})")
    with open(demo_file, "w") as file:
        file.write(filedata)
    demo_thread = threading.Thread(target=launch_demo, args=(demo_folder,))
    demo_thread.start()

start_time = time.time()
while True:
    for demo_name, _ in demo_port_sets:
        r = requests.get(f"http://localhost:80/demo/{demo_name}/config")
        if r.status_code != 200:
            print(demo_name, "down")
            if time.time() - start_time > LAUNCH_PERIOD:
                raise ValueError(f"{demo_name} is down.")
        else:
            print(demo_name, "up")
    time.sleep(10)

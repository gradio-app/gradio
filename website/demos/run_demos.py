import importlib
import json
import os
import subprocess
import sys
import threading
import time

import requests

GRADIO_DEMO_DIR = "../../demo"
sys.path.insert(0, GRADIO_DEMO_DIR)

demo_threads = {}
demos_up = set()

with open("demos.json") as demos_file:
    demo_port_sets = json.load(demos_file)

time_to_up = {}

def launch_demo(demo_folder):
    subprocess.check_call([f"cd {demo_folder} && python run2.py"], shell=True)

SUFFIX = "_component"
COMPONENTS_DEMOS_FOLDER = os.path.join(GRADIO_DEMO_DIR, 'components_demos')
start_launch_time = time.time()
for demo_name, port in demo_port_sets:
    if demo_name.endswith(SUFFIX):
        demo_folder = COMPONENTS_DEMOS_FOLDER
        demo_file = os.path.join(demo_folder, "run.py")
        component_folder = os.path.join(GRADIO_DEMO_DIR, demo_name)
        os.mkdir(component_folder)
        demo_2_file = os.path.join(component_folder, "run2.py")
        with open(demo_file, "r") as file:
            filedata = file.read()
        filedata += f"\n{demo_name[:-len(SUFFIX)]}_demo.launch(server_port={port}, _frontend=False)"
    else:
        demo_folder = os.path.join(GRADIO_DEMO_DIR, demo_name)
        demo_file = os.path.join(demo_folder, "run.py")
        demo_2_file = os.path.join(demo_folder, "run2.py")
        with open(demo_file, "r") as file:
            filedata = file.read()
        assert "demo.launch()" in filedata, demo_name + " has no demo.launch()\n" + filedata
        filedata = filedata.replace(f"demo.launch()", f"demo.launch(server_port={port}, _frontend=False)")
    with open(demo_2_file, "w") as file:
        file.write(filedata)
    demo_thread = threading.Thread(target=launch_demo, args=(demo_folder,))
    time_to_up[demo_name] = -(time.time())
    demo_thread.start()
    demo_threads[demo_name] = demo_thread

print("launch time:", time.time() - start_launch_time)

while True:
    still_down = []
    stayed_up = []
    for demo_name, _ in demo_port_sets:
        r = requests.get(f"http://localhost:80/demo/{demo_name}/config")
        if r.status_code != 200:
            if demo_name in demos_up:
                print(demo_name, "came down. Restarting.")
                t = demo_threads[demo_name]
                t.raise_exception()
                t.join()
                demo_thread = threading.Thread(target=launch_demo, args=(demo_name,))
                demo_thread.start()
                demo_threads[demo_name] = demo_thread
                demos_up.remove(demo_name)
            else:
                still_down.append(demo_name)
        else:
            if demo_name in demos_up:
                stayed_up.append(demo_name)
            else:
                demos_up.add(demo_name)
                time_to_up[demo_name] += time.time()
                print(demo_name, "is up!")
    print("stayed up: " + " ".join(stayed_up))
    print("still_down: " + " ".join(still_down))
    print("time_to_up: " + ", ".join([f"({d}, {t})" for d, t in time_to_up.items() if t > 0]))
    time.sleep(1)

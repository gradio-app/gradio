import time
import os
import requests
import json
import importlib
import sys
import threading
import subprocess

LAUNCH_PERIOD = 60
GRADIO_DEMO_DIR = "../../demo"
sys.path.insert(0, GRADIO_DEMO_DIR)

with open("demos.json") as demos_file:
    demo_port_sets = json.load(demos_file)

def launch_demo(demo_name, port):
    demo_folder = os.path.join(GRADIO_DEMO_DIR, demo_name)
    os.chdir(demo_folder)
    with open('run.py', 'r') as file:
        filedata = file.read()
    filedata = filedata.replace(
        f'if __name__ == "__main__":', 
        f'if __name__ == "__main__":\n    iface.server_port={port}')
    print(filedata)
    with open('run.py', 'w') as file:
        file.write(filedata)
    subprocess.call(f"python run.py", shell=True)

for demo_name, port in demo_port_sets:
    demo_thread = threading.Thread(target=launch_demo, args=(demo_name, port))
    demo_thread.start()

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

import os
import subprocess

for f in os.listdir(os.path.dirname(__file__)):
    if ".spec.ts" in f:
        split_tup = f.split(".")
        command = f'python ../../../../demo/write_config.py {split_tup[0]} ../../../../demo/{split_tup[0]}/config.json'
        process = subprocess.Popen(command.split(), stdout=subprocess.PIPE, cwd=os.path.dirname(__file__))
        output, error = process.communicate()
    
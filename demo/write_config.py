"""Writes the config file for any of the demos to an output file

Usage: python write_config.py <demo_name> <output_file>
Example: python write_config.py calculator output.json 

Assumes:
- The demo_name is a folder in this directory
- The demo_name folder contains a run.py file 
- The run.py file defines a Gradio Interface/Blocks instance called `demo`
"""

from __future__ import annotations

import argparse
import importlib
import json

import gradio as gr

parser = argparse.ArgumentParser()
parser.add_argument("demo_name", help="the name of the demo whose config to write")
parser.add_argument("file_path", help="the path at which to write the config file")
args = parser.parse_args()

# import the run.py file from inside the directory specified by args.demo_name
run = importlib.import_module(f"{args.demo_name}.run")

demo: gr.Blocks = run.demo
config = demo.get_config_file()

json.dump(config, open(args.file_path, "w"), indent=2)

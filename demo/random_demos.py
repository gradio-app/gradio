"""Opens X demos randomly for quick inspection

Usage: python random_demos.py <num_demos>
Example: python random_demos.py 8

Assumes:
- This is being run from the gradio/demo/ directory
"""

from __future__ import annotations

import argparse
import importlib
import os
import random

import gradio as gr

parser = argparse.ArgumentParser()
parser.add_argument("num_demos", help="number of demos to launch", type=int, default=4)
args = parser.parse_args()

# get the list of directory names
demos_list = next(os.walk('.'))[1]

# Some demos are just too large or need to be run in a special way, so we'll just skip them
demos_list.remove('streaming_wav2vec')
demos_list.remove('blocks_neural_instrument_coding')
demos_list.remove('flagged')

for d, demo_name in enumerate(random.sample(demos_list, args.num_demos)):
    print(f"Launching demo {d+1}/{args.num_demos}: {demo_name}")
    # import the run.py file from inside the directory specified by args.demo_name
    run = importlib.import_module(f"{demo_name}.run")
    demo: gr.Blocks = run.demo
    if d == args.num_demos - 1:
        demo.launch(prevent_thread_lock=False, inbrowser=True)  # prevent main thread from exiting
    else:
        demo.launch(prevent_thread_lock=True, inbrowser=True)
        
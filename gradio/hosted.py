"""
This file is used by launch models on a hosted service, like `GradioHub`
"""

import tempfile
import traceback
import webbrowser

import gradio.inputs
import gradio.outputs
from gradio import networking, strings
from distutils.version import StrictVersion
import pkg_resources
import requests
import random
import time

def launch_from_config(path):
	pass
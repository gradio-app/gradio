# Contains the function that runs when `gradio` is called from the command line. Specifically, allows
# $ gradio app.py to run app.py in development mode where any changes reload the script.

import os
import sys

def main():
    args = sys.argv[1:]
    
    path = args[0]
    path = os.path.normpath(path)
    if "/" in path or "\\" in path:
        raise ValueError("Must provide file name in the current directory")
    filename = os.path.splitext(path)[0]   
    
    os.system(f"uvicorn {filename}:demo.app --reload")


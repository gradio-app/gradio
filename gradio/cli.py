import sys
import gradio.reload
import gradio.upload

def cli():
    args = sys.argv[1:]
    if len(args) == 0:
        raise ValueError("No file specified.")
    if args[0] == "--deploy":
        gradio.upload.upload_to_spaces()
    else:
        gradio.reload.run_in_reload_mode(*args)

import subprocess, sys
subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', './src/'])

import gradio as gr
from gradio.oauth import OAuthToken
from gradio_workflowcanvas import WorkflowCanvas
from gradio_client import Client, handle_file
from typing import Optional
import json
import os


def get_token(token: Optional[OAuthToken] = None) -> str:
    if token is None:
        return ""
    return token.token


def call_space(data, token: Optional[OAuthToken] = None) -> str:
    try:
        space_id = data[0]
        endpoint = data[1] if len(data) > 1 else None
        args_json = data[2] if len(data) > 2 else "[]"

        hf_token = token.token if token else None
        client = Client(space_id, token=hf_token)
        args = json.loads(args_json)

        if not endpoint or endpoint == "/predict":
            api_info = client.view_api(return_format="dict")
            named = list(api_info.get("named_endpoints", {}).keys())
            if endpoint and endpoint in named:
                pass
            elif named:
                endpoint = named[0]
            else:
                endpoint = "/predict"

        processed = []
        for arg in args:
            if arg is None:
                processed.append(None)
            elif isinstance(arg, dict) and ("url" in arg or "path" in arg):
                url = arg.get("url") or arg.get("path", "")
                if url:
                    processed.append(handle_file(url))
                else:
                    processed.append(None)
            else:
                processed.append(arg)

        result = client.predict(*processed, api_name=endpoint)

        if not isinstance(result, (list, tuple)):
            result = [result]
        else:
            result = list(result)

        output = []
        for item in result:
            if isinstance(item, str) and os.path.exists(item):
                output.append({"path": item, "url": item, "is_file": True})
            elif isinstance(item, dict):
                output.append(item)
            elif isinstance(item, (list, tuple)):
                sub = []
                for s in item:
                    if isinstance(s, str) and os.path.exists(s):
                        sub.append({"path": s, "url": s, "is_file": True})
                    elif isinstance(s, dict):
                        sub.append(s)
                    else:
                        sub.append(s)
                output.append(sub)
            else:
                output.append(item)

        return json.dumps(output)
    except Exception as e:
        return json.dumps({"error": str(e)})


with gr.Blocks(css=".toast-wrap { display: none !important; }") as demo:
    with gr.Row():
        gr.LoginButton(size="sm", scale=0)
    canvas = WorkflowCanvas(server_functions=[get_token, call_space])

if __name__ == "__main__":
    demo.launch()

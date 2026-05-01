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


def classify_error(e: Exception) -> dict:
    """Classify an error into a type and suggestion for the frontend."""
    title = getattr(e, 'title', None) or ""
    message = getattr(e, 'message', None) or str(e)
    full = f"{title} {message}".lower()

    if "zerogpu" in full or "gpu" in full and "worker" in full:
        return {"error_type": "gpu", "suggestion": "GPU unavailable — try again or log in with your HF account"}
    if "quota" in full or "rate limit" in full:
        return {"error_type": "quota", "suggestion": "GPU quota exceeded — log in with your HF account for more compute"}
    if "sleeping" in full or "paused" in full:
        return {"error_type": "sleeping", "suggestion": "Space is sleeping or paused — try again in a minute"}
    if "not found" in full or "404" in full or "repository not found" in full:
        return {"error_type": "not_found", "suggestion": "Space not found — it may have been deleted or renamed"}
    if "build_error" in full or "build error" in full:
        return {"error_type": "build_error", "suggestion": "Space has a build error — contact the Space owner"}
    if "timed out" in full or "timeout" in full or "connection" in full:
        return {"error_type": "connection", "suggestion": "Could not connect to the Space — it may be down"}

    return {"error_type": "unknown", "suggestion": ""}


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

        # Strip trailing None args so the Space uses its own defaults.
        # view_api(return_format="dict") returns default=None even when defaults
        # exist, so we'd otherwise pass null for optional args and get
        # "No value provided for required argument".
        while processed and processed[-1] is None:
            processed.pop()

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
        title = getattr(e, 'title', None)
        message = getattr(e, 'message', None) or str(e)
        classified = classify_error(e)
        error_info = {
            "error": message,
            **classified,
        }
        if title:
            error_info["title"] = title
        return json.dumps(error_info)


with gr.Blocks() as demo:
    canvas = WorkflowCanvas(server_functions=[get_token, call_space])

if __name__ == "__main__":
    demo.launch(css=".toast-wrap { display: none !important; }")

"""Utility function for gradio/external.py"""

import math
import numbers
import json
import re
import warnings
from typing import Any,TYPE_CHECKING, Dict, List, Tuple
import requests
import yaml
import websockets
from packaging import version

from gradio import exceptions

if TYPE_CHECKING:
    from gradio.components import DataframeData


### Helper functions for processing tabular data

def get_tabular_examples(model_name: str) -> Dict[str, List[float]]:
    readme = requests.get(f"https://huggingface.co/{model_name}/resolve/main/README.md")
    if readme.status_code != 200:
        warnings.warn(f"Cannot load examples from README for {model_name}", UserWarning)
        example_data = {}
    else:
        yaml_regex = re.search(
            "(?:^|[\r\n])---[\n\r]+([\\S\\s]*?)[\n\r]+---([\n\r]|$)", readme.text
        )
        example_yaml = next(yaml.safe_load_all(readme.text[: yaml_regex.span()[-1]]))
        example_data = example_yaml.get("widget", {}).get("structuredData", {})
    if not example_data:
        raise ValueError(
            f"No example data found in README.md of {model_name} - Cannot build gradio demo. "
            "See the README.md here: https://huggingface.co/scikit-learn/tabular-playground/blob/main/README.md "
            "for a reference on how to provide example data to your model."
        )
    # replace nan with string NaN for inference API
    for data in example_data.values():
        for i, val in enumerate(data):
            if isinstance(val, numbers.Number) and math.isnan(val):
                data[i] = "NaN"
    return example_data


def cols_to_rows(
    example_data: Dict[str, List[float]]
) -> Tuple[List[str], List[List[float]]]:
    headers = list(example_data.keys())
    n_rows = max(len(example_data[header] or []) for header in headers)
    data = []
    for row_index in range(n_rows):
        row_data = []
        for header in headers:
            col = example_data[header] or []
            if row_index >= len(col):
                row_data.append("NaN")
            else:
                row_data.append(col[row_index])
        data.append(row_data)
    return headers, data


def rows_to_cols(
    incoming_data: DataframeData,
) -> Dict[str, Dict[str, Dict[str, List[str]]]]:
    data_column_wise = {}
    for i, header in enumerate(incoming_data["headers"]):
        data_column_wise[header] = [str(row[i]) for row in incoming_data["data"]]
    return {"inputs": {"data": data_column_wise}}

### Helper functions for connecting to websockets

async def get_pred_from_ws(
    websocket: websockets.WebSocketClientProtocol, data: str, hash_data: str
) -> Dict[str, Any]:
    completed = False
    while not completed:
        msg = await websocket.recv()
        resp = json.loads(msg)
        if resp["msg"] == "queue_full":
            raise exceptions.Error("Queue is full! Please try again.")
        if resp["msg"] == "send_hash":
            await websocket.send(hash_data)
        elif resp["msg"] == "send_data":
            await websocket.send(data)
        completed = resp["msg"] == "process_completed"
    return resp["output"]


def get_ws_fn(ws_url):
    async def ws_fn(data, hash_data):
        async with websockets.connect(ws_url, open_timeout=10) as websocket:
            return await get_pred_from_ws(websocket, data, hash_data)

    return ws_fn


def use_websocket(config, dependency):
    queue_enabled = config.get("enable_queue", False)
    queue_uses_websocket = version.parse(
        config.get("version", "2.0")
    ) >= version.Version("3.2")
    dependency_uses_queue = dependency.get("queue", False) is not False
    return queue_enabled and queue_uses_websocket and dependency_uses_queue

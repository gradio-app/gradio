"""The main Client class for the Python client."""
from __future__ import annotations

import concurrent.futures
from concurrent.futures import Future
import json
import re
from typing import Callable, Dict

import requests

from gradio_client import utils


class Client:
    def __init__(
        self, 
        space: str | None = None, 
        src: str | None = None, 
        access_token: str | None = None, 
        max_workers: int = 40
    ):
        if space is None and src is None:
            raise ValueError("Either `space` or `src` must be provided")
        elif space and src:
            raise ValueError("Only one of `space` or `src` must be provided")
        
        self.space = space
        self.src = src or self._space_name_to_src()
        if self.src is None:
            raise ValueError(f"Could not find Space: {space}. If it is a private Space, please provide an access_token.")
        self.access_token = access_token
        self.headers = {"Authorization": "Bearer {access_token}"} if access_token else {}
        self.api_url = utils.API_URL.format(self.src)        
        self.ws_url = utils.WS_URL.format(self.src).replace("https", "wss")
        self.config = self._get_config()
        
        # Create a pool of threads to handle the requests
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)

    def predict(self, args, api_name: str | None = None, fn_index: int = 0) -> Future:
        predict_fn = self._get_predict_fn(api_name, fn_index)
        future = self.executor.submit(predict_fn, *args)
        return future

    #################
    # Helper methods
    #################
    
    def _get_predict_fn(self, api_name: str | None, fn_index: int) -> Callable:
        if api_name is not None:
            inferred_fn_index = next(
                (
                    i
                    for i, d in enumerate(self.config["dependencies"])
                    if d.get("api_name") == api_name
                ),
                None,
            )
            if inferred_fn_index is None:
                raise ValueError(f"Cannot find a function with api_name: {api_name}")
            fn_index = inferred_fn_index        
        
        return lambda *args: None

    def __del__(self):
        if hasattr(self, "executor"):
            self.executor.shutdown(wait=True)
   
    def _space_name_to_src(self) -> str | None:
        return (
            requests.get(
                f"https://huggingface.co/api/spaces/{self.space}/host", headers=self.headers
            )
            .json()
            .get("host")
        )

    def _get_config(self) -> Dict:
        assert self.src is not None
        r = requests.get(self.src, headers=self.headers)        
        # some basic regex to extract the config
        result = re.search(r"window.gradio_config = (.*?);[\s]*</script>", r.text)
        try:
            config = json.loads(result.group(1))  # type: ignore
        except AttributeError:
            raise ValueError(f"Could not get Gradio config from: {self.src}")
        if "allow_flagging" in config:
            raise ValueError(f"Gradio 2.x is not supported by this client. Please upgrade this app to Gradio 3.x.")
        return config
        


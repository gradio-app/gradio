"""The main Client class for the Python client."""
from __future__ import annotations

import concurrent.futures
from concurrent.futures import Future
from typing import Callable

from gradio_client import utils


class Client:
    def __init__(
        self, 
        space: str | None = None, 
        src: str | None = None, 
        access_token: str | None = None, 
        max_workers: int = 5
    ):
        if space is None and src is None:
            raise ValueError("Either `space` or `src` must be provided")
        elif space and src:
            raise ValueError("Only one of `space` or `src` must be provided")
        
        self.space = space
        self.src = src or utils.space_name_to_src(space)
        self.api_url = utils.API_URL.format(self.src)        
        self.ws_url = utils.WS_URL.format(self.src).replace("https", "wss")
        
        # Create a pool of threads to handle the requests
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)

    def get_predict_fn(self, api_name: str | None) -> Callable:
        # Should make the connection with the remote API and return the result
        return lambda *args: None

    def __del__(self):
        if hasattr(self, "executor"):
            self.executor.shutdown(wait=True)

    def predict(self, args, api_name: str | None = None) -> Future:
        predict_fn = self.get_predict_fn(api_name)
        future = self.executor.submit(predict_fn, *args)
        return future

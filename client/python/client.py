"""The main Client class for the Python client."""

import concurrent.futures
from concurrent.futures import Future

import utils


class Client:
    def __init__(self, space=None, src=None, max_workers=5):
        if space is None and src is None:
            raise ValueError("Either `space` or `src` must be provided")
        elif space and src:
            raise ValueError("Only one of `space` or `src` must be provided")
        else:
            self.space = space
            self.src = src or utils.space_name_to_src(space)

        # Create persistent websocket connection
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)

    def predict_api(self, *args):
        # Should make the connection with the remote API and return the result
        pass

    def __del__(self):
        if hasattr(self, "executor"):
            self.executor.shutdown(wait=True)

    def predict(self, args, api_name=None) -> Future:
        future = self.executor.submit(self.predict_api, *args)
        return future

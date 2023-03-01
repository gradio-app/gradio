"""The main Client class for the Python client."""

import concurrent.futures
from concurrent.futures import Future


class Client:
    def __init__(self, space, src, max_workers=5):
        # Create persistent websocket connection
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=max_workers)
    
    def predict_api(self, *args):
        # Should make the connection with the remote API and return the result
        pass
    
    def __del__(self):
        self.executor.shutdown(wait=True)
    
    def predict(self, args, api_name=None) -> Future:
        future = self.executor.submit(self.predict_api, *args)
        return future   


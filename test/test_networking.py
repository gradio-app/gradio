"""Contains tests for networking.py and app.py"""

import http.server
import os
import socket
import socketserver
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

import requests
import uvicorn
from fastapi import FastAPI
from fastapi.testclient import TestClient

from gradio import Interface, networking
from gradio.route_utils import API_PREFIX

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestInterfaceErrors:
    def test_processing_error(self):
        io = Interface(lambda x: 1 / x, "number", "number", api_name="predict")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(
            f"{API_PREFIX}/api/predict/", json={"data": [0], "fn_index": 0}
        )
        assert response.status_code == 500
        assert "error" in response.json()
        io.close()

    def test_validation_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(f"{API_PREFIX}/api/predict/", json={"fn_index": [0]})
        assert response.status_code == 422
        io.close()


class TestURLs:
    def test_url_ok(self):
        res = networking.url_ok("https://www.gradio.app")
        assert res


def test_start_server_app_kwargs():
    """
    Test that start_server accepts app_kwargs and they're propagated to FastAPI.
    """
    io = Interface(lambda x: x, "number", "number")
    app, _, _ = io.launch(
        show_error=True,
        prevent_thread_lock=True,
        app_kwargs={
            "docs_url": f"{API_PREFIX}/docs",
        },
    )
    client = TestClient(app)
    assert client.get(f"{API_PREFIX}/docs").status_code == 200
    io.close()


def test_reverse_proxy():
    import gradio as gr

    demo = Interface(lambda x: x, "text", "text")
    app = FastAPI()

    gr.mount_gradio_app(app, demo, path="/gradio")

    def is_port_available(port):
        try:
            s = socket.socket()
            s.bind(("127.0.0.1", target_port))
            s.close()
            return True
        except OSError:
            return False

    for target_port in range(8000, 8100):
        if is_port_available(target_port):
            break
    else:
        raise ValueError("No available ports")

    for proxy_port in range(18000, 18100):
        if is_port_available(proxy_port):
            break
    else:
        raise ValueError("No available ports")

    target_host = "localhost"

    class HTMLReverseProxyHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):  # noqa
            self.handle_request()

        def do_HEAD(self):  # noqa
            self.handle_request()

        def do_POST(self):  # noqa
            self.handle_request()

        def do_PUT(self):  # noqa
            self.handle_request()

        def do_DELETE(self):  # noqa
            self.handle_request()

        def do_OPTIONS(self):  # noqa
            self.handle_request()

        def do_PATCH(self):  # noqa
            self.handle_request()

        def handle_request(self):
            # Store the original path for reference and content rewriting
            original_path = self.path

            # Extract the path without query string
            request_path = original_path.split("?", 1)[0]

            # Check if the path is for a JS module
            is_js_request = request_path.endswith(".js")

            # Forward the full original path to the target server
            target_url = f"http://{target_host}:{target_port}{original_path}"

            # Get the request body if present
            content_length = int(self.headers.get("Content-Length", 0))
            request_body = None
            if content_length > 0:
                request_body = self.rfile.read(content_length)

            # Forward headers (excluding hop-by-hop headers)
            headers = {}
            for key, value in self.headers.items():
                if key.lower() not in (
                    "connection",
                    "keep-alive",
                    "proxy-authenticate",
                    "proxy-authorization",
                    "te",
                    "trailers",
                    "transfer-encoding",
                    "upgrade",
                    "host",
                ):
                    headers[key] = value

            # Set the correct host header
            headers["Host"] = f"{target_host}:{target_port}"

            # Add X-Forwarded headers for better compatibility
            headers["X-Forwarded-For"] = self.client_address[0]
            headers["X-Forwarded-Host"] = self.headers.get("Host", "")
            headers["X-Forwarded-Proto"] = "http"

            try:
                # Create and send the request
                req = urllib.request.Request(
                    url=target_url,
                    data=request_body,
                    headers=headers,
                    method=self.command,
                )

                # Get the response
                with urllib.request.urlopen(req) as response:
                    # Get all response headers
                    response_headers = dict(response.getheaders())
                    content_type = response_headers.get("Content-Type", "")

                    # Send response status code
                    self.send_response(response.status)

                    # Special handling for JavaScript files
                    if is_js_request and "javascript" not in content_type.lower():
                        self.send_header("Content-Type", "application/javascript")
                    # For non-JS files, use the original content type
                    elif "Content-Type" in response_headers:
                        self.send_header("Content-Type", content_type)

                    # Forward all other headers
                    for key, value in response_headers.items():
                        if key.lower() not in (
                            "content-type",
                            "content-length",
                            "connection",
                            "keep-alive",
                            "transfer-encoding",
                        ):
                            self.send_header(key, value)

                    # Add additional headers for security and transparency
                    self.send_header("X-Proxy-By", "Python-HTML-Rewriting-Proxy")
                    self.end_headers()

                    # Read the response body
                    response_data = response.read()

                    # Handle HTML content rewriting
                    if "text/html" in content_type.lower():
                        try:
                            html_content = response_data.decode("utf-8")
                            response_data = html_content.encode("utf-8")
                        except Exception as e:
                            print(f"Error processing HTML: {str(e)}")

                    # Send the response body (potentially modified)
                    self.wfile.write(response_data)

            except urllib.error.HTTPError as e:
                # Special handling for JS requests that get errors
                if is_js_request:
                    self.send_response(e.code)
                    self.send_header("Content-Type", "application/javascript")
                    self.end_headers()
                    self.wfile.write(f"/* Error: {e.code} */".encode())
                else:
                    # Normal error handling
                    self.send_response(e.code)

                    for key, value in e.headers.items():
                        if key.lower() not in (
                            "connection",
                            "keep-alive",
                            "transfer-encoding",
                        ):
                            self.send_header(key, value)

                    self.end_headers()
                    self.wfile.write(e.read())

            except urllib.error.URLError as e:
                # Special handling for JS requests
                if is_js_request:
                    self.send_response(502)
                    self.send_header("Content-Type", "application/javascript")
                    self.end_headers()
                    self.wfile.write(
                        f"/* Error connecting to server: {e.reason} */".encode()
                    )
                else:
                    # Normal error handling
                    self.send_response(502)  # Bad Gateway
                    self.send_header("Content-Type", "text/plain")
                    self.end_headers()
                    self.wfile.write(
                        f"Error connecting to upstream server: {e.reason}".encode()
                    )

            except Exception as e:
                # Special handling for JS requests
                if is_js_request:
                    self.send_response(500)
                    self.send_header("Content-Type", "application/javascript")
                    self.end_headers()
                    self.wfile.write(f"/* Internal proxy error: {str(e)} */".encode())
                else:
                    # Normal error handling
                    self.send_response(500)
                    self.send_header("Content-Type", "text/plain")
                    self.end_headers()
                    self.wfile.write(f"Proxy error: {str(e)}".encode())

    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.ThreadingTCPServer(
        ("localhost", proxy_port), HTMLReverseProxyHandler
    )
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.start()

    config = uvicorn.Config(app, port=target_port, loop="asyncio")
    uvicorn_server = uvicorn.Server(config)
    uvicorn_thread = threading.Thread(target=uvicorn_server.run)
    uvicorn_thread.start()

    try:
        attempts = 5
        status_code = None
        while attempts > 0 and status_code != 200:
            attempts -= 1
            try:
                response = requests.get(
                    f"http://localhost:{target_port}/gradio/", timeout=1
                )
                status_code = response.status_code
            except Exception:
                time.sleep(1)

        if attempts == 0:
            raise TimeoutError("Server did not start in time")

        response = requests.get(f"http://localhost:{proxy_port}/gradio/")
        assert response.status_code == 200

        response = requests.get(f"http://localhost:{proxy_port}/gradio/config")
        assert response.status_code == 200
        json = response.json()
        assert json["root"] == f"http://localhost:{proxy_port}/gradio"

    finally:
        server.shutdown()
        server.server_close()
        uvicorn_server.should_exit = True
        uvicorn_thread.join()

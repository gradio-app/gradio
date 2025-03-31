"""Contains tests for networking.py and app.py"""

import os
import http.server
import socketserver
import urllib.request
import urllib.error
import urllib.parse
import re
from fastapi import FastAPI
import threading
import uvicorn
import requests
import time

from fastapi.testclient import TestClient

from gradio import Interface, networking
from gradio.route_utils import API_PREFIX


import gradio as gr

demo = Interface(lambda x: x, "text", "text")
app = FastAPI()

gr.mount_gradio_app(app, demo, path="/gradio")

target_port = 8000 
target_host = "localhost"


class HTMLReverseProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.handle_request()
        
    def do_HEAD(self):
        self.handle_request()
    
    def do_POST(self):
        self.handle_request()
    
    def do_PUT(self):
        self.handle_request()
    
    def do_DELETE(self):
        self.handle_request()
    
    def do_OPTIONS(self):
        self.handle_request()
        
    def do_PATCH(self):
        self.handle_request()
    
    def handle_request(self):
        # Store the original path for reference and content rewriting
        original_path = self.path
        
        # Extract the path without query string
        request_path = original_path.split('?', 1)[0]
        
        # Check if the path is for a JS module
        is_js_request = request_path.endswith('.js')
        
        # Extract the base path component for HTML rewriting
        # e.g., for "/app/page" this would be "/app"
        if request_path == '/':
            base_path = ''
        else:
            # Get the first path component to use for rewriting
            base_path = '/' + request_path.strip('/').split('/', 1)[0]
        
        # Forward the full original path to the target server
        target_url = f"http://{target_host}:{target_port}{original_path}"
        
        # Get the request body if present
        content_length = int(self.headers.get('Content-Length', 0))
        request_body = None
        if content_length > 0:
            request_body = self.rfile.read(content_length)
        
        # Forward headers (excluding hop-by-hop headers)
        headers = {}
        for key, value in self.headers.items():
            if key.lower() not in ('connection', 'keep-alive', 'proxy-authenticate',
                                'proxy-authorization', 'te', 'trailers',
                                'transfer-encoding', 'upgrade', 'host'):
                headers[key] = value
        
        # Set the correct host header
        headers['Host'] = f"{target_host}:{target_port}"
        
        # Add X-Forwarded headers for better compatibility
        headers['X-Forwarded-For'] = self.client_address[0]
        headers['X-Forwarded-Host'] = self.headers.get('Host', '')
        headers['X-Forwarded-Proto'] = 'http'
        
        try:
            # Create and send the request
            req = urllib.request.Request(
                url=target_url,
                data=request_body,
                headers=headers,
                method=self.command
            )
            
            # Get the response
            with urllib.request.urlopen(req) as response:
                # Get all response headers
                response_headers = dict(response.getheaders())
                content_type = response_headers.get('Content-Type', 'text/html')
                
                # Send response status code
                self.send_response(response.status)
                
                # Special handling for JavaScript files
                if is_js_request and 'javascript' not in content_type.lower():
                    self.send_header('Content-Type', 'application/javascript')
                else:
                    # For non-JS files, use the original content type
                    if 'Content-Type' in response_headers:
                        self.send_header('Content-Type', content_type)
                
                # Forward all other headers
                for key, value in response_headers.items():
                    if key.lower() not in ('content-type', 'content-length', 'connection', 'keep-alive', 'transfer-encoding'):
                        self.send_header(key, value)
                
                # Add additional headers for security and transparency
                self.send_header('X-Proxy-By', 'Python-HTML-Rewriting-Proxy')
                self.end_headers()
                
                # Read the response body
                response_data = response.read()
                
                print("CONTENTNTTm", content_type)
                # Handle HTML content rewriting
                if 'text/html' in content_type.lower():
                    try:
                        html_content = response_data.decode('utf-8')
                        
                        # Rewrite relative paths in HTML to include the base path
                        if base_path:
                            # Find and rewrite src="./assets/...
                            html_content = re.sub(
                                r'(src|href)="\./(.*?)"', 
                                f'\\1="{base_path}/\\2"', 
                                html_content
                            )
                            
                            # Find and rewrite src="assets/...
                            html_content = re.sub(
                                r'(src|href)="(?!http|https|/)(.*?)"', 
                                f'\\1="{base_path}/\\2"', 
                                html_content
                            )
                            
                        response_data = html_content.encode('utf-8')
                    except Exception as e:
                        print(f"Error processing HTML: {str(e)}")
                
                # Send the response body (potentially modified)
                self.wfile.write(response_data)
            
        except urllib.error.HTTPError as e:                
            # Special handling for JS requests that get errors
            if is_js_request:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/javascript')
                self.end_headers()
                self.wfile.write(f"/* Error: {e.code} */".encode())
            else:
                # Normal error handling
                self.send_response(e.code)
                
                for key, value in e.headers.items():
                    if key.lower() not in ('connection', 'keep-alive', 'transfer-encoding'):
                        self.send_header(key, value)
                
                self.end_headers()
                self.wfile.write(e.read())
            
        except urllib.error.URLError as e:                
            # Special handling for JS requests
            if is_js_request:
                self.send_response(502)
                self.send_header('Content-Type', 'application/javascript')
                self.end_headers()
                self.wfile.write(f"/* Error connecting to server: {e.reason} */".encode())
            else:
                # Normal error handling
                self.send_response(502)  # Bad Gateway
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"Error connecting to upstream server: {e.reason}".encode())
            
        except Exception as e:
            # Special handling for JS requests
            if is_js_request:
                self.send_response(500)
                self.send_header('Content-Type', 'application/javascript')
                self.end_headers()
                self.wfile.write(f"/* Internal proxy error: {str(e)} */".encode())
            else:
                # Normal error handling
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"Proxy error: {str(e)}".encode())

proxy_port = 17860

socketserver.TCPServer.allow_reuse_address = True
server = socketserver.ThreadingTCPServer(('localhost', proxy_port), HTMLReverseProxyHandler)
# server_thread = threading.Thread(target=server.serve_forever)
# server_thread.start()
server.serve_forever()

# config = uvicorn.Config(app, port=target_port, loop="asyncio")
# uvicorn_server = uvicorn.Server(config)
# uvicorn_thread = threading.Thread(target=uvicorn_server.run)
# uvicorn_thread.start()

# attempts = 5
# status_code = None
# while attempts > 0 and not status_code == 200:
#     attempts -= 1
#     try:
#         response = requests.get(f"http://localhost:{target_port}/gradio/")
#         status_code = response.status_code
#     except Exception as e:
#         time.sleep(1)

# if attempts == 0:
#     server.shutdown()
#     server.server_close()
#     uvicorn_thread.join()
#     raise TimeoutError("Server did not start in time")

# response = requests.get(f"http://localhost:{proxy_port}/gradio/theme.css")

# print(1)
# server.shutdown()
# print(2)
# server.server_close()
# print(3)
# uvicorn_server.should_exit = True
# uvicorn_thread.join()
# print(4)

# assert response.status_code == 200

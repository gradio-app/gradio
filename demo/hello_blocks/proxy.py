import http.server
import socketserver
import urllib.request
import urllib.error
import urllib.parse
import sys
import re

# Configuration
PROXY_PORT = 17861 
TARGET_HOST = "localhost"
TARGET_PORT = 8000
DEBUG = True  # Set to True for verbose logging

class HTMLRewritingProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_debug(self, message):
        if DEBUG:
            print(f"[DEBUG] {message}")

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
        if is_js_request:
            self.log_debug(f"JavaScript request detected: {original_path}")
        
        # Extract the base path component for HTML rewriting
        # e.g., for "/app/page" this would be "/app"
        if request_path == '/':
            base_path = ''
        else:
            # Get the first path component to use for rewriting
            base_path = '/' + request_path.strip('/').split('/', 1)[0]
            self.log_debug(f"Base path determined to be: {base_path}")
        
        # Forward the full original path to the target server
        target_url = f"http://{TARGET_HOST}:{TARGET_PORT}{original_path}"
        self.log_debug(f"Proxying request from {original_path} -> {target_url}")
        
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
        headers['Host'] = f"{TARGET_HOST}:{TARGET_PORT}"
        
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
                content_type = response_headers.get('Content-Type', '')
                self.log_debug(f"Response content type: {content_type}")
                
                # Send response status code
                self.send_response(response.status)
                
                # Special handling for JavaScript files
                if is_js_request and 'javascript' not in content_type.lower():
                    self.log_debug(f"Correcting MIME type for JavaScript: {content_type} -> application/javascript")
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
                
                # Handle HTML content rewriting
                if 'text/html' in content_type.lower():
                    try:
                        html_content = response_data.decode('utf-8')
                        self.log_debug(f"Processing HTML content ({len(html_content)} bytes)")
                        
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
                            
                            self.log_debug(f"Rewrote HTML content to fix relative paths")
                        
                        response_data = html_content.encode('utf-8')
                    except Exception as e:
                        self.log_debug(f"Error processing HTML: {str(e)}")
                
                # Send the response body (potentially modified)
                self.wfile.write(response_data)
                self.log_debug(f"Successfully proxied {len(response_data)} bytes")
            
        except urllib.error.HTTPError as e:
            # Forward HTTP errors from the target
            self.log_debug(f"Target server returned HTTP error: {e.code}")
            
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
            # Handle connection errors
            self.log_debug(f"URLError: {e.reason}")
            
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
            # Handle unexpected errors
            self.log_debug(f"Unexpected error: {str(e)}")
            
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
    
    def log_message(self, format, *args):
        """Override to provide cleaner logging"""
        sys.stderr.write(f"[Proxy] {self.client_address[0]} - {format % args}\n")

def main():
    # Allow the server to reuse the address
    socketserver.TCPServer.allow_reuse_address = True
    
    # Create and start the server
    httpd = socketserver.ThreadingTCPServer(("", PROXY_PORT), HTMLRewritingProxyHandler)
    print(f"Starting HTML rewriting proxy on port {PROXY_PORT}")
    print(f"Proxying requests to http://{TARGET_HOST}:{TARGET_PORT}")
    print(f"Debug mode: {'On' if DEBUG else 'Off'}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        httpd.shutdown()
        print("Server stopped")

if __name__ == "__main__":
    main()
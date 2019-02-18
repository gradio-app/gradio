import subprocess
import requests
import zipfile
import io
import sys

INITIAL_PORT_VALUE = '6002'
NGROK_ZIP_URLS = {
    "linux": "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip",
    "darwin": "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-darwin-amd64.zip",
    "win32": "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip",
}

def start_simple_server():
    subprocess.Popen(['python', '-m', 'http.server', INITIAL_PORT_VALUE])
    return 'http://localhost:{}/'.format(INITIAL_PORT_VALUE)

def download_ngrok():
    try:
        zip_file_url = NGROK_ZIP_URLS[sys.platform]
    except KeyError:
        print("Sorry, we don't currently support your operating system, please leave us a note on GitHub, and we'll look into it!")
        return

    r = requests.get(zip_file_url)
    z = zipfile.ZipFile(io.BytesIO(r.content))
    z.extractall("gradio/")


def setup_ngrok(local_port):

import pkgutil

from gradio_client.client import Client

__version__ = (pkgutil.get_data(__name__, "version.txt") or b"").decode("ascii").strip()

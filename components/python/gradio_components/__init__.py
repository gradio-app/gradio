"""The UI components of Gradio.

Install with `pip install "gradio[components]"` and use through `import gradio as gr`.
"""

import json
from pathlib import Path

__version__ = json.loads((Path(__file__).parent / "package.json").read_text())[
    "version"
]

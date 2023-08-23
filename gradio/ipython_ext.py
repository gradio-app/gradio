try:
    from IPython.core.magic import needs_local_scope, register_cell_magic, magics_class, Magics, cell_magic
    from IPython.core.magic_arguments import (argument, magic_arguments,
                                        parse_argstring)
except ImportError:
    pass

from gradio.reload import _get_config
import secrets
import os
import dataclasses
import importlib
from pathlib import Path


@dataclasses.dataclass
class State:
    path: Path = None
    launched: bool = False


def load_ipython_extension(ipython):
    state = State()

    @magic_arguments()
    @argument(
        "--demo-name",
        default="demo",
        help="Name of gradio blocks instance."
    )
    @register_cell_magic
    @needs_local_scope
    def blocks(line, cell, local_ns=None):
        print(local_ns)
        args = parse_argstring(blocks, line)
        if not state.path:
            dir_ = Path(f"gradio_reload") / f"{secrets.token_hex(10)}"
            dir_.mkdir(parents=True)
            app = Path(dir_ / "app.py")
            state.path = app
            local_ns["__gr_path___"] = str(app)
        state.path.write_text(cell)
        if not state.launched:     
            filename, _, watch_dirs = _get_config(str(state.path))
            os.environ["GRADIO_WATCH_DIRS"] = ",".join(watch_dirs)
            os.environ["GRADIO_WATCH_FILE"] = filename
            os.environ["GRADIO_WATCH_DEMO_NAME"] = args.demo_name
            exec(cell, None, local_ns)
            #mod = importlib.import_module(filename)
            #mod.demo.launch()
            state.launched = True
            #state.artifact = mod.demo.artifact
        else:
            pass
            #return state.artifact

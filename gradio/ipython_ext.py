try:
    from IPython.core.magic import (
        needs_local_scope,
        register_cell_magic,
    )
    from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring
except ImportError:
    pass

import gradio as gr
from gradio.routes import App
from gradio.utils import BaseReloader


class CellIdTracker:
    """Determines the most recently run cell in the notebook.

    Needed to keep track of which demo the user is updating.
    """

    def __init__(self, ipython):
        ipython.events.register("pre_run_cell", self.pre_run_cell)
        self.shell = ipython
        self.current_cell: str = ""

    def pre_run_cell(self, info):
        self._current_cell = info.cell_id


class JupyterReloader(BaseReloader):
    """Swap a running blocks class in a notebook with the latest cell contents."""

    def __init__(self, ipython) -> None:
        super().__init__()
        self._cell_tracker = CellIdTracker(ipython)
        self._running: dict[str, gr.Blocks] = {}

    @property
    def current_cell(self):
        return self._cell_tracker.current_cell

    @property
    def running_app(self) -> App:
        if not self.running_demo.server:
            raise RuntimeError("Server not running")
        return self.running_demo.server.running_app  # type: ignore

    @property
    def running_demo(self):
        return self._running[self.current_cell]

    def demo_tracked(self) -> bool:
        return self.current_cell in self._running

    def track(self, demo: gr.Blocks):
        self._running[self.current_cell] = demo


def load_ipython_extension(ipython):
    reloader = JupyterReloader(ipython)

    @magic_arguments()
    @argument("--demo-name", default="demo", help="Name of gradio blocks instance.")
    @argument(
        "--share",
        default=False,
        const=True,
        nargs="?",
        help="Whether to launch with sharing. Will slow down reloading.",
    )
    @register_cell_magic
    @needs_local_scope
    def blocks(line, cell, local_ns):
        """Launch a demo defined in a cell in reload mode."""

        args = parse_argstring(blocks, line)

        exec(cell, None, local_ns)
        demo: gr.Blocks = local_ns[args.demo_name]
        if not reloader.demo_tracked():
            demo.launch(share=args.share)
            reloader.track(demo)
        elif reloader.queue_changed(demo):
            print("Queue got added or removed. Restarting demo.")
            reloader.running_demo.close()
            demo.launch()
            reloader.track(demo)
        else:
            reloader.swap_blocks(demo)
            return reloader.running_demo.artifact

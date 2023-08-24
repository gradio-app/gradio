try:
    from IPython.core.magic import (
        needs_local_scope,
        register_cell_magic,
    )
    from IPython.core.magic_arguments import argument, magic_arguments, parse_argstring
except ImportError:
    pass

import threading

import gradio as gr


class CellIdTracker:
    def __init__(self, ip):
        self.shell = ip
        self.current_cell = None

    def pre_run_cell(self, info):
        self.current_cell = info.cell_id


class State:
    def __init__(self, ipython) -> None:
        self._cell_tracker = CellIdTracker(ipython)
        ipython.events.register("pre_run_cell", self._cell_tracker.pre_run_cell)
        self._running: dict[str, gr.Blocks] = {}

    @property
    def current_cell(self):
        return self._cell_tracker.current_cell

    @property
    def running_demo(self):
        return self._running[self.current_cell]

    def demo_tracked(self) -> bool:
        return self.current_cell in self._running

    def track(self, demo: gr.Blocks):
        self._running[self.current_cell] = demo

    def queue_changed(self, demo: gr.Blocks):
        return (
            hasattr(self.running_demo, "_queue") and not hasattr(demo, "_queue")
        ) or (not hasattr(self.running_demo, "_queue") and hasattr(demo, "_queue"))


def load_ipython_extension(ipython):
    state = State(ipython)

    @magic_arguments()
    @argument("--demo-name", default="demo", help="Name of gradio blocks instance.")
    @register_cell_magic
    @needs_local_scope
    def blocks(line, cell, local_ns):
        args = parse_argstring(blocks, line)
        exec(cell, None, local_ns)
        demo: gr.Blocks = local_ns[args.demo_name]
        if not state.demo_tracked():
            demo.launch(share=True)
            demo.server.app.change_event = threading.Event()
            state.track(demo)
        elif state.queue_changed(demo):
            state.running_demo.close()
            demo.launch()
            demo.server.app.change_event = threading.Event()
            state.track(demo)
        else:
            if hasattr(state.running_demo.server.app.blocks, "_queue"):
                state.running_demo.server.app.blocks._queue.blocks_dependencies = (
                    demo.dependencies
                )
                demo._queue = state.running_demo.server.app.blocks._queue
            state.running_demo.server.app.blocks = demo
            state.running_demo.server.app.change_event.set()
            return state.running_demo.artifact

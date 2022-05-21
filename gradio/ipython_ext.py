try:
    from IPython.core.magic import register_cell_magic
except ImportError:
    pass

import gradio


def load_ipython_extension(ipython):
    __demo = gradio.Blocks()

    @register_cell_magic
    def blocks(line, cell):
        with __demo.clear():
            exec(cell)
            __demo.launch(quiet=True)

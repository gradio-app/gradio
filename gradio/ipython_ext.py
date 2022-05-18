try:
    from IPython.core.magic import register_cell_magic
except ImportError:
    pass

import gradio


def load_ipython_extension(ipython):
    demo = gradio.Blocks()

    @register_cell_magic
    def blocks(line, cell):
        with demo.clear():
            exec(cell)
            demo.launch(quiet=True)

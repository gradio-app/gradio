import asyncio
import uuid

from gradio.components import Button, _Keywords
from gradio.context import Context
from gradio.blocks import update


class StopButton:

    def __init__(self, *dependencies):

        fn_to_comp = {}
        for dep in dependencies:
            fn_index = next(i for i, d in enumerate(Context.root_block.dependencies) if d == dep)
            fn_to_comp[fn_index] = [Context.root_block.blocks[o] for o in dep['outputs']]

        async def stop(session_hash: str):
            output = {}
            for comps in fn_to_comp.values():
                for comp in comps:
                    output[comp] = update(value=_Keywords.NO_VALUE)
            task_ids = set([f"{session_hash}_{fn_index}" for fn_index in fn_to_comp])

            for task in filter(lambda t: not t.cancelled(), asyncio.all_tasks()):
                if task.get_name() in task_ids:
                    matching_id = None
                    for id_ in task_ids:
                        if task.get_name() == id_:
                            matching_id = id_
                    fn_index_ = int(matching_id.split("_")[1])
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        print(f"Cancelled task {matching_id}")
                    for comp in fn_to_comp[fn_index_]:
                        output[comp] = update(value=None)
            return output

        self.fn_index = fn_index
        self.fn_to_comp = fn_to_comp
        self.is_stop = True
        self.stop = Button(value="Stop")
        self.stop.is_stop = True
        self.stop.fn_to_comp = fn_to_comp
        self.stop.click(stop, inputs=None, outputs=[c for comps in fn_to_comp.values() for c in comps], queue=False, preprocess=False)
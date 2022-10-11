from __future__ import annotations

import asyncio
import warnings
from typing import TYPE_CHECKING, Any, AnyStr, Callable, Dict, List, Optional, Tuple

from gradio.blocks import Block, Context, update

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component, StatusTracker


def get_cancel_function(
    dependencies: List[Dict[str, Any]]
) -> Tuple[Callable, List[Block], List[int]]:
    fn_to_comp = {}
    for dep in dependencies:
        fn_index = next(
            i for i, d in enumerate(Context.root_block.dependencies) if d == dep
        )
        fn_to_comp[fn_index] = [Context.root_block.blocks[o] for o in dep["outputs"]]

    async def cancel(session_hash: str):
        from gradio.components import _Keywords

        output = {}
        for comps in fn_to_comp.values():
            for comp in comps:
                output[comp] = update(value=_Keywords.NO_VALUE)
        task_ids = set([f"{session_hash}_{fn}" for fn in fn_to_comp])

        for task in asyncio.all_tasks():
            if task.get_name() in task_ids:
                matching_id = None
                for id_ in task_ids:
                    if task.get_name() == id_:
                        matching_id = id_
                fn_index_ = int(matching_id.split("_")[1])
                task.cancel()
                await asyncio.gather(task, return_exceptions=True)
                print(f"Cancelled task {matching_id}")
                for comp in fn_to_comp[fn_index_]:
                    output[comp] = update(value=None)
        return output

    return (
        cancel,
        [c for comps in fn_to_comp.values() for c in comps],
        list(fn_to_comp.keys()),
    )


def set_cancel_events(block: Block, event_name: str, cancels: List[Dict[str, Any]]):
    if cancels:
        cancel_fn, output, fn_indices_to_cancel = get_cancel_function(cancels)
        block.set_event_trigger(
            event_name,
            cancel_fn,
            inputs=None,
            outputs=output,
            queue=False,
            preprocess=False,
            cancels=fn_indices_to_cancel,
        )


class Changeable(Block):
    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component's input value changes (e.g. when the user types in a textbox
        or uploads an image). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "change",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "change", cancels)
        return dep


class Clickable(Block):
    def click(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue=None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component (e.g. a button) is clicked.
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "click",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            queue=queue,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
        )
        set_cancel_events(self, "click", cancels)
        return dep


class Submittable(Block):
    def submit(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user presses the Enter key while the component (e.g. a textbox) is focused.
        This method can be used when this component is in a Gradio Blocks.


        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "submit",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "submit", cancels)
        return dep


class Editable(Block):
    def edit(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user edits the component (e.g. image) using the
        built-in editor. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "edit",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "edit", cancels)
        return dep


class Clearable(Block):
    def clear(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user clears the component (e.g. image or audio)
        using the X button for the component. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "submit",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "submit", cancels)
        return dep


class Playable(Block):
    def play(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user plays the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "play",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "play", cancels)
        return dep

    def pause(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: Optional[AnyStr] = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user pauses the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "pause",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "pause", cancels)
        return dep

    def stop(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user stops the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "stop",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "stop", cancels)
        return dep


class Streamable(Block):
    def stream(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = False,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user streams the component (e.g. a live webcam
        component). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        self.streaming = True

        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        dep = self.set_event_trigger(
            "stream",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )
        set_cancel_events(self, "stream", cancels)
        return dep


class Blurrable(Block):
    def blur(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component's is unfocused/blurred (e.g. when the user clicks outside of a textbox). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.

        self.set_event_trigger(
            "blur",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=preprocess,
            postprocess=postprocess,
            queue=queue,
        )

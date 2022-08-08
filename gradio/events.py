from __future__ import annotations

from typing import TYPE_CHECKING, Any, AnyStr, Callable, Dict, List, Optional, Tuple

from gradio.blocks import Block

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component, StatusTracker


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
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the component's input value changes (e.g. when the user types in a textbox
        or uploads an image). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            status_tracker: StatusTracker to visualize function progress
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "change",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            status_tracker=status_tracker,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
        )


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
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the component (e.g. a button) is clicked.
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            status_tracker: StatusTracker to visualize function progress
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "click",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            status_tracker=status_tracker,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            queue=queue,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
        )


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
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the user presses the Enter key while the component (e.g. a textbox) is focused.
        This method can be used when this component is in a Gradio Blocks.


        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            status_tracker: StatusTracker to visualize function progress
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "submit",
            fn,
            inputs,
            outputs,
            status_tracker=status_tracker,
            api_name=api_name,
            scroll_to_output=scroll_to_output,
            show_progress=show_progress,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
        )


class Editable(Block):
    def edit(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        queue: Optional[bool] = None,
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the user edits the component (e.g. image) using the
        built-in editor. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "edit",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
        )


class Clearable(Block):
    def clear(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        queue: Optional[bool] = None,
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the user clears the component (e.g. image or audio)
        using the X button for the component. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "submit",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
        )


class Playable(Block):
    def play(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        queue: Optional[bool] = None,
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the user plays the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "play",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
        )

    def pause(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: Optional[AnyStr] = None,
        queue: Optional[bool] = None,
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the user pauses the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "pause",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
        )

    def stop(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        queue: Optional[bool] = None,
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the user stops the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.set_event_trigger(
            "stop",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
        )


class Streamable(Block):
    def stream(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        show_progress: bool = False,
        queue: Optional[bool] = None,
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        This event is triggered when the user streams the component (e.g. a live webcam
        component). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            queue: If True, will place the request on the queue, if the queue exists
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        # _preprocess: If False, will not run preprocessing of component data before running 'fn'.
        # _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        self.streaming = True
        self.set_event_trigger(
            "stream",
            fn,
            inputs,
            outputs,
            api_name=api_name,
            js=_js,
            preprocess=_preprocess,
            postprocess=_postprocess,
            queue=queue,
            show_progress=False,
        )

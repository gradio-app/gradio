from __future__ import annotations

from typing import TYPE_CHECKING, Any, Callable, Dict, List, Optional, Tuple

from gradio.blocks import Block

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component, StatusTracker


class Changeable(Block):
    def change(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status_tracker: StatusTracker to visualize function progress
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of input and outputs components, return should be a list of values for output component.
        Returns: None
        """
        self.set_event_trigger(
            "change", fn, inputs, outputs, status_tracker=status_tracker, js=_js
        )


class Clickable(Block):
    def click(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        status_tracker: Optional[StatusTracker] = None,
        queue=None,
        _js: Optional[str] = None,
        _preprocess: bool = True,
        _postprocess: bool = True,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status_tracker: StatusTracker to visualize function progress
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            _preprocess: If False, will not run preprocessing of component data before running 'fn'.
            _postprocess: If False, will not run postprocessing of component data before returning 'fn' output.
        Returns: None
        """
        self.set_event_trigger(
            "click",
            fn,
            inputs,
            outputs,
            status_tracker=status_tracker,
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
        status_tracker: Optional[StatusTracker] = None,
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            status_tracker: StatusTracker to visualize function progress
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        self.set_event_trigger(
            "submit", fn, inputs, outputs, status_tracker=status_tracker, js=_js
        )


class Editable(Block):
    def edit(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        self.set_event_trigger("edit", fn, inputs, outputs, js=_js)


class Clearable(Block):
    def clear(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        self.set_event_trigger("submit", fn, inputs, outputs, js=_js)


class Playable(Block):
    def play(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        self.set_event_trigger("play", fn, inputs, outputs, js=_js)

    def pause(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        self.set_event_trigger("pause", fn, inputs, outputs, js=_js)

    def stop(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        _js: Optional[str] = None,
    ):
        """
        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        Returns: None
        """
        self.set_event_trigger("stop", fn, inputs, outputs, js=_js)

from __future__ import annotations

import asyncio
import sys
import warnings
from typing import TYPE_CHECKING, Any, AnyStr, Callable, Dict, List, Optional, Tuple
from typing_extensions import Literal

from gradio.blocks import Block, Context, update

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    from gradio.components import Component, StatusTracker


def get_cancel_function(
    dependencies: List[Dict[str, Any]]
) -> Tuple[Callable, List[int]]:
    fn_to_comp = {}
    for dep in dependencies:
        fn_index = next(
            i for i, d in enumerate(Context.root_block.dependencies) if d == dep
        )
        fn_to_comp[fn_index] = [Context.root_block.blocks[o] for o in dep["outputs"]]

    async def cancel(session_hash: str) -> None:
        if sys.version_info < (3, 8):
            return None

        task_ids = set([f"{session_hash}_{fn}" for fn in fn_to_comp])

        matching_tasks = [
            task for task in asyncio.all_tasks() if task.get_name() in task_ids
        ]
        for task in matching_tasks:
            task.cancel()
        await asyncio.gather(*matching_tasks, return_exceptions=True)

    return (
        cancel,
        list(fn_to_comp.keys()),
    )


def set_cancel_events(
    block: Block, event_name: str, cancels: None | Dict[str, Any] | List[Dict[str, Any]]
):
    if cancels:
        if not isinstance(cancels, list):
            cancels = [cancels]
        cancel_fn, fn_indices_to_cancel = get_cancel_function(cancels)
        block.set_event_trigger(
            event_name,
            cancel_fn,
            inputs=None,
            outputs=None,
            queue=False,
            preprocess=False,
            cancels=fn_indices_to_cancel,
        )


class Changeable(Block):
    def change(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component's input value changes (e.g. when the user types in a textbox
        or uploads an image). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "change", cancels)
        return dep


class Clickable(Block):
    def click(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue=None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component (e.g. a button) is clicked.
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
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
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user presses the Enter key while the component (e.g. a textbox) is focused.
        This method can be used when this component is in a Gradio Blocks.


        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "submit", cancels)
        return dep


class Editable(Block):
    def edit(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user edits the component (e.g. image) using the
        built-in editor. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "edit", cancels)
        return dep


class Clearable(Block):
    def clear(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user clears the component (e.g. image or audio)
        using the X button for the component. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "submit", cancels)
        return dep


class Playable(Block):
    def play(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user plays the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "play", cancels)
        return dep

    def pause(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: Optional[AnyStr] = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user pauses the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "pause", cancels)
        return dep

    def stop(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user stops the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "stop", cancels)
        return dep


class Streamable(Block):
    def stream(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = False,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user streams the component (e.g. a live webcam
        component). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: the function to wrap an interface around. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "stream", cancels)
        return dep


class Blurrable(Block):
    def blur(
        self,
        fn: Callable,
        inputs: Component | List[Component] | None | Literal["all"] = None,
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: Dict[str, Any] | List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component's is unfocused/blurred (e.g. when the user clicks outside of a textbox). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "blur", cancels)


class Uploadable(Block):
    def upload(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: Component | List[Component] | None = None,
        api_name: AnyStr = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: List[Dict[str, Any]] | None = None,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user uploads a file into the component (e.g. when the user uploads a video into a video component). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function
            inputs: List of inputs
            outputs: List of outputs
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this event is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.

        self.set_event_trigger(
            "upload",
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
            batch=batch,
            max_batch_size=max_batch_size,
        )
        set_cancel_events(self, "upload", cancels)

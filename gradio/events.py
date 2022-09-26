from __future__ import annotations

import warnings
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component's input value changes (e.g. when the user types in a textbox
        or uploads an image). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the component (e.g. a button) is clicked.
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user presses the Enter key while the component (e.g. a textbox) is focused.
        This method can be used when this component is in a Gradio Blocks.


        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user edits the component (e.g. image) using the
        built-in editor. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user clears the component (e.g. image or audio)
        using the X button for the component. This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user plays the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user pauses the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user stops the component (e.g. audio or video).
        This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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


class Streamable(Block):
    def stream(
        self,
        fn: Callable,
        inputs: List[Component],
        outputs: List[Component],
        api_name: AnyStr = None,
        status_tracker: Optional[StatusTracker] = None,
        scroll_to_output: bool = False,
        show_progress: bool = True,
        queue: Optional[bool] = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        _js: Optional[str] = None,
    ):
        """
        This event is triggered when the user streams the component (e.g. a live webcam
        component). This method can be used when this component is in a Gradio Blocks.

        Parameters:
            fn: Callable function. When batch is False, each parameter of the function corresponds to one input component, and each return value corresponds to one output component. But if batch is True, the function must accept a *single* parameter, which is a *nested* list of inputs, where the outer list represents the batch, and the inner list represents the inputs to underlying prediction. For example, if the prediction takes two inputs, the input to the function would be [[input1, input2], [input1, input2], [input1, input2]]. Similarly, the function must return a single *nested* list of outputs. For example, if the prediction has one output, the output of the function should be [[output1], [output1], [output1]].
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as inputs. If the function returns no outputs, this should be an empty list.
            api_name: Defining this parameter exposes the endpoint in the api docs
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue exists
            batch: If True, we expect the function to take a list of inputs (up to length `max_batch_size`) and return a list of outputs of equal length
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True, and queue is enabled for this event)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        """
        # _js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
        self.streaming = True

        if status_tracker:
            warnings.warn(
                "The 'status_tracker' parameter has been deprecated and has no effect."
            )

        self.set_event_trigger(
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

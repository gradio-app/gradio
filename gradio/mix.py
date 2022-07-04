"""
Ways to transform interfaces to produce new interfaces
"""
from typing import TYPE_CHECKING, List

import gradio

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio.components import IOComponent


class Parallel(gradio.Interface):
    """
    Creates a new Interface consisting of multiple models in parallel (comparing their outputs).
    The Interfaces to put in Parallel must share the same input components (but can have different output components).
    """

    def __init__(self, *interfaces: gradio.Interface, **options):
        """
        Parameters:
        *interfaces (Interface): any number of Interface objects that are to be compared in parallel
        **options (optional): additional kwargs that are passed into the new Interface object to customize it
        Returns:
        (Interface): an Interface object comparing the given models
        """
        outputs: List[IOComponent] = []

        for interface in interfaces:
            outputs.extend(interface.output_components)

        def parallel_fn(*args):
            return_values = []
            for interface in interfaces:
                value = interface.run_prediction(args)
                return_values.extend(value)
            if len(outputs) == 1:
                return return_values[0]
            return return_values

        parallel_fn.__name__ = " | ".join([io.__name__ for io in interfaces])

        kwargs = {
            "fn": parallel_fn,
            "inputs": interfaces[0].input_components,
            "outputs": outputs,
        }
        kwargs.update(options)
        super().__init__(**kwargs)


class Series(gradio.Interface):
    """
    Creates a new Interface from multiple models in series (the output of one is fed as the input to the next,
    and so the input and output components must agree between the interfaces).
    """

    def __init__(self, *interfaces: gradio.Interface, **options):
        """
        Parameters:
        *interfaces (Interface): any number of Interface objects that are to be connected in series
        **options (optional): additional kwargs that are passed into the new Interface object to customize it
        Returns:
        (Interface): an Interface object connecting the given models
        """

        def connected_fn(
            *data,
        ):  # Run each function with the appropriate preprocessing and postprocessing
            for idx, interface in enumerate(interfaces):
                # skip preprocessing for first interface since the Series interface will include it
                if idx > 0 and not (interface.api_mode):
                    data = [
                        input_component.preprocess(data[i])
                        for i, input_component in enumerate(interface.input_components)
                    ]

                # run all of predictions sequentially
                data = interface.run_prediction(data)

                # skip postprocessing for final interface since the Series interface will include it
                if idx < len(interfaces) - 1 and not (interface.api_mode):
                    data = [
                        output_component.postprocess(data[i])
                        for i, output_component in enumerate(
                            interface.output_components
                        )
                    ]

            if len(interfaces[-1].output_components) == 1:
                return data[0]
            return data

        connected_fn.__name__ = " => ".join([io.__name__ for io in interfaces])

        kwargs = {
            "fn": connected_fn,
            "inputs": interfaces[0].input_components,
            "outputs": interfaces[-1].output_components,
        }
        kwargs.update(options)
        super().__init__(**kwargs)

"""
Ways to transform interfaces to produce new interfaces
"""
import warnings
from typing import List

import gradio
from gradio.documentation import document, set_documentation_group

set_documentation_group("mix_interface")


@document()
class Parallel(gradio.Interface):
    """
    Creates a new Interface consisting of multiple models in parallel (comparing their outputs).
    The Interfaces to put in Parallel must share the same input components (but can have different output components).
    """

    def __init__(
        self, *interfaces: List[gradio.Interface], **options: dict
    ) -> gradio.Interface:
        """
        Parameters:
            interfaces: any number of Interface objects that are to be compared in parallel
            options: additional kwargs that are passed into the new Interface object to customize it
        Returns:
            an Interface object comparing the given models
        """
        fns = []
        outputs = []

        for io in interfaces:
            if not (isinstance(io, gradio.Interface)):
                warnings.warn(
                    "Parallel may not work properly with non-Interface objects."
                )
            fns.extend(io.predict)
            outputs.extend(io.output_components)

        def parallel_fn(*args):
            return_values = []
            for fn in fns:
                value = fn(*args)
                if isinstance(value, tuple):
                    return_values.extend(value)
                else:
                    return_values.append(value)
            return return_values

        kwargs = {
            "fn": parallel_fn,
            "inputs": interfaces[0].input_components,
            "outputs": outputs,
            "_repeat_outputs_per_model": False,
        }
        kwargs.update(options)
        super().__init__(**kwargs)
        self.api_mode = interfaces[
            0
        ].api_mode  # TODO(abidlabs): make api_mode a per-function attribute


@document()
class Series(gradio.Interface):
    """
    Creates a new Interface from multiple models in series (the output of one is fed as the input to the next,
    and so the input and output components must agree between the interfaces).
    """

    def __init__(self, *interfaces: List[gradio.Interface], **options: dict):
        """
        Parameters:
            interfaces: any number of Interface objects that are to be connected in series
            options: additional kwargs that are passed into the new Interface object to customize it
        Returns:
            an Interface object connecting the given models
        """
        fns = []
        for io in interfaces:
            if not (isinstance(io, gradio.Interface)):
                warnings.warn(
                    "Series may not work properly with non-Interface objects."
                )
            fns.append(io.predict)

        def connected_fn(
            *data,
        ):  # Run each function with the appropriate preprocessing and postprocessing
            for idx, io in enumerate(interfaces):
                # skip preprocessing for first interface since the Series interface will include it
                if idx > 0 and not (io.api_mode):
                    data = [
                        input_component.preprocess(data[i])
                        for i, input_component in enumerate(io.input_components)
                    ]

                # run all of predictions sequentially
                predictions = []
                for predict_fn in io.predict:
                    prediction = predict_fn(*data)
                    predictions.append(prediction)
                data = predictions
                # skip postprocessing for final interface since the Series interface will include it
                if idx < len(interfaces) - 1 and not (io.api_mode):
                    data = [
                        output_component.postprocess(data[i])
                        for i, output_component in enumerate(io.output_components)
                    ]

            return data[0]

        connected_fn.__name__ = " => ".join([f[0].__name__ for f in fns])

        kwargs = {
            "fn": connected_fn,
            "inputs": interfaces[0].input_components,
            "outputs": interfaces[-1].output_components,
        }
        kwargs.update(options)
        super().__init__(**kwargs)
        self.api_mode = interfaces[
            0
        ].api_mode  # TODO(abidlabs): make api_mode a per-function attribute

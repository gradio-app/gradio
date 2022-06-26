"""
Defines helper methods useful for loading and caching Interface examples.
"""
from __future__ import annotations

import csv
import os
import shutil
from typing import TYPE_CHECKING, Any, List, Tuple, Optional, Callable

from gradio.flagging import CSVLogger
from gradio.components import Dataset

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio import Interface
    from gradio.components import Component    

CACHED_FOLDER = "gradio_cached_examples"
CACHE_FILE = os.path.join(CACHED_FOLDER, "log.csv")


class Examples():
    def __init__(
        examples: List[Any] | List[List[Any]] | str,
        inputs: Component | List[Component],
        cache: bool = False,
        fn: Optional[Callable] = None,
        outputs: Optional[Component | List[Component]] = None,
        ):
        """
        This class can be used to create Examples for Blocks / Interfaces
        examples (List[Any] | List[List[Any]] | str): example inputs that can be clicked to populate specific components. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided. 
        inputs: (Component | List[Component]): the component or list of components corresponding to the examples
        cache (bool | None): if True, caches examples for fast runtime. The default option in HuggingFace Spaces is True. The default option elsewhere is False.
        fn: (Callable | None): optionally, provide the function to run to generate the outputs corresponding to the examples. Required if `cache` is True.
        outputs: (Component | List[Component] | None): optionally, provide the component or list of components corresponding to the output of the examples. Required if `cache` is True.
        """
        
        if examples is None or (
            isinstance(examples, list)
            and (len(examples) == 0 or isinstance(examples[0], list))
        ):
            pass
        elif (
            isinstance(examples, list) and len(inputs) == 1
        ):  # If there is only one input component, examples can be provided as a regular list instead of a list of lists
            examples = [[e] for e in examples]
        elif isinstance(examples, str):
            if not os.path.exists(examples):
                raise FileNotFoundError(
                    "Could not find examples directory: " + examples
                )
            log_file = os.path.join(examples, "log.csv")
            if not os.path.exists(log_file):
                if len(inputs) == 1:
                    exampleset = [
                        [os.path.join(examples, item)] for item in os.listdir(examples)
                    ]
                else:
                    raise FileNotFoundError(
                        "Could not find log file (required for multiple inputs): "
                        + log_file
                    )
            else:
                with open(log_file) as logs:
                    exampleset = list(csv.reader(logs))
                    exampleset = exampleset[1:]  # remove header
            for i, example in enumerate(exampleset):
                for j, (component, cell) in enumerate(
                    zip(
                        inputs + outputs,
                        example,
                    )
                ):
                    exampleset[i][j] = component.restore_flagged(
                        examples,
                        cell,
                        None,
                    )
            examples = exampleset
        else:
            raise ValueError(
                "Examples argument must either be a directory or a nested "
                "list, where each sublist represents a set of inputs."
            )
        
        dataset = Dataset(
            components=inputs,
            samples=examples,
            type="index",
        )
        
        def load_example(example_id):
            processed_examples = [
                component.preprocess_example(sample)
                for component, sample in zip(
                    inputs, examples[example_id]
                )
            ]
            if cache:
                processed_examples += load_from_cache(self, example_id)
            if len(processed_examples) == 1:
                return processed_examples[0]
            else:
                return processed_examples

        dataset.click(
            load_example,
            inputs=[examples],
            outputs=inputs
            + (outputs if cache else []),
            _postprocess=False,
            queue=False,
        )
            

def process_example(
    interface: Interface, example_id: int
) -> Tuple[List[Any], List[float]]:
    """Loads an example from the interface and returns its prediction."""
    example_set = interface.examples[example_id]
    raw_input = [
        interface.input_components[i].preprocess_example(example)
        for i, example in enumerate(example_set)
    ]
    prediction = interface.process(raw_input)
    return prediction


def cache_interface_examples(interface: Interface) -> None:
    """Caches all of the examples from an interface."""
    if os.path.exists(CACHE_FILE):
        print(
            f"Using cache from '{os.path.abspath(CACHED_FOLDER)}/' directory. If method or examples have changed since last caching, delete this folder to clear cache."
        )
    else:
        print(
            f"Cache at {os.path.abspath(CACHE_FILE)} not found. Caching now in '{CACHED_FOLDER}/' directory."
        )
        cache_logger = CSVLogger()
        cache_logger.setup(interface.output_components, CACHED_FOLDER)
        for example_id, _ in enumerate(interface.examples):
            try:
                prediction = process_example(interface, example_id)
                cache_logger.flag(prediction)
            except Exception as e:
                shutil.rmtree(CACHED_FOLDER)
                raise e


def load_from_cache(interface: Interface, example_id: int) -> List[Any]:
    """Loads a particular cached example for the interface."""
    with open(CACHE_FILE) as cache:
        examples = list(csv.reader(cache, quotechar="'"))
    example = examples[example_id + 1]  # +1 to adjust for header
    output = []
    for component, cell in zip(interface.output_components, example):
        output.append(
            component.restore_flagged(
                CACHED_FOLDER,
                cell,
                interface.encryption_key if interface.encrypt else None,
            )
        )
    return output

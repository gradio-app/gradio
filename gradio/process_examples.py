"""
Defines helper methods useful for loading and caching Interface examples.
"""
from __future__ import annotations

import csv
import os
import shutil
from typing import TYPE_CHECKING, Any, List, Tuple

from gradio.flagging import CSVLogger

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio import Interface

CACHED_FOLDER = "gradio_cached_examples"
CACHE_FILE = os.path.join(CACHED_FOLDER, "log.csv")


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
        examples = list(csv.reader(cache))
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

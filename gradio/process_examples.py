import os, shutil
from gradio.flagging import CSVLogger
from typing import Any, List
import csv

CACHED_FOLDER = "gradio_cached_examples"
CACHE_FILE = os.path.join(CACHED_FOLDER, "log.csv")

def process_example(interface, example_id: int):
    example_set = interface.examples[example_id]
    raw_input = [interface.input_components[i].preprocess_example(example) for i, example in enumerate(example_set)]
    prediction, durations = interface.process(raw_input)
    return prediction, durations

def cache_interface_examples(interface) -> None:
    if os.path.exists(CACHE_FILE):
        print(f"Using cache from '{os.path.abspath(CACHED_FOLDER)}/' directory. If method or examples have changed since last caching, delete this folder to clear cache.")
    else:
        print(f"Cache at {os.path.abspath(CACHE_FILE)} not found. Caching now in '{CACHED_FOLDER}/' directory.")
        cache_logger = CSVLogger()
        cache_logger.setup(CACHED_FOLDER)
        for example_id, _ in enumerate(interface.examples):
            try:
                prediction = process_example(interface, example_id)[0]
                cache_logger.flag(interface, None, prediction)
            except Exception as e:
                shutil.rmtree(CACHED_FOLDER)
                raise e

def load_from_cache(interface, example_id: int) -> List[Any]:
    with open(CACHE_FILE) as cache:
        examples = list(csv.reader(cache))
    example = examples[example_id + 1] # +1 to adjust for header
    output = []
    for component, cell in zip(interface.output_components, example):
        output.append(component.restore_flagged(
            CACHED_FOLDER, cell, interface.encryption_key if interface.encrypt else None))
    return output

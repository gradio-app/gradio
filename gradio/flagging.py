from __future__ import annotations

import contextlib
import csv
import datetime
import os
import re
import time
from abc import ABC, abstractmethod
from collections.abc import Sequence
from multiprocessing import Lock
from pathlib import Path
from typing import TYPE_CHECKING, Any

from gradio_client import utils as client_utils
from gradio_client.documentation import document

import gradio as gr
from gradio import utils, wasm_utils

if TYPE_CHECKING:
    from gradio.components import Component


class FlaggingCallback(ABC):
    """
    An abstract class for defining the methods that any FlaggingCallback should have.
    """

    @abstractmethod
    def setup(self, components: Sequence[Component], flagging_dir: str):
        """
        This method should be overridden and ensure that everything is set up correctly for flag().
        This method gets called once at the beginning of the Interface.launch() method.
        Parameters:
        components: Set of components that will provide flagged data.
        flagging_dir: A string, typically containing the path to the directory where the flagging file should be stored (provided as an argument to Interface.__init__()).
        """
        pass

    @abstractmethod
    def flag(
        self,
        flag_data: list[Any],
        flag_option: str | None = None,
        username: str | None = None,
    ) -> int:
        """
        This method should be overridden by the FlaggingCallback subclass and may contain optional additional arguments.
        This gets called every time the <flag> button is pressed.
        Parameters:
        interface: The Interface object that is being used to launch the flagging interface.
        flag_data: The data to be flagged.
        flag_option (optional): In the case that flagging_options are provided, the flag option that is being used.
        username (optional): The username of the user that is flagging the data, if logged in.
        Returns:
        (int) The total number of samples that have been flagged.
        """
        pass


@document()
class SimpleCSVLogger(FlaggingCallback):
    """
    A simplified implementation of the FlaggingCallback abstract class
    provided for illustrative purposes.  Each flagged sample (both the input and output data)
    is logged to a CSV file on the machine running the gradio app.
    Example:
        import gradio as gr
        def image_classifier(inp):
            return {'cat': 0.3, 'dog': 0.7}
        demo = gr.Interface(fn=image_classifier, inputs="image", outputs="label",
                            flagging_callback=SimpleCSVLogger())
    """

    def __init__(self):
        pass

    def setup(self, components: Sequence[Component], flagging_dir: str | Path):
        self.components = components
        self.flagging_dir = flagging_dir
        os.makedirs(flagging_dir, exist_ok=True)

    def flag(
        self,
        flag_data: list[Any],
        flag_option: str | None = None,  # noqa: ARG002
        username: str | None = None,  # noqa: ARG002
    ) -> int:
        flagging_dir = self.flagging_dir
        log_filepath = Path(flagging_dir) / "log.csv"

        csv_data = []
        for component, sample in zip(self.components, flag_data, strict=False):
            save_dir = Path(
                flagging_dir
            ) / client_utils.strip_invalid_filename_characters(component.label or "")
            save_dir.mkdir(exist_ok=True)
            csv_data.append(
                component.flag(
                    sample,
                    save_dir,
                )
            )

        with open(log_filepath, "a", encoding="utf-8", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(utils.sanitize_list_for_csv(csv_data))

        with open(log_filepath, encoding="utf-8") as csvfile:
            line_count = len(list(csv.reader(csvfile))) - 1
        return line_count


@document()
class ClassicCSVLogger(FlaggingCallback):
    """
    The classic implementation of the FlaggingCallback abstract class in gradio<5.0. Each flagged
    sample (both the input and output data) is logged to a CSV file with headers on the machine running the gradio app.
    Example:
        import gradio as gr
        def image_classifier(inp):
            return {'cat': 0.3, 'dog': 0.7}
        demo = gr.Interface(fn=image_classifier, inputs="image", outputs="label",
                            flagging_callback=ClassicCSVLogger())
    Guides: using-flagging
    """

    def __init__(self, simplify_file_data: bool = True):
        self.simplify_file_data = simplify_file_data

    def setup(
        self,
        components: Sequence[Component],
        flagging_dir: str | Path,
    ):
        self.components = components
        self.flagging_dir = flagging_dir
        os.makedirs(flagging_dir, exist_ok=True)

    def flag(
        self,
        flag_data: list[Any],
        flag_option: str | None = None,
        username: str | None = None,
    ) -> int:
        flagging_dir = self.flagging_dir
        log_filepath = Path(flagging_dir) / "log.csv"
        is_new = not Path(log_filepath).exists()
        headers = [
            getattr(component, "label", None) or f"component {idx}"
            for idx, component in enumerate(self.components)
        ] + [
            "flag",
            "username",
            "timestamp",
        ]

        csv_data = []
        for idx, (component, sample) in enumerate(
            zip(self.components, flag_data, strict=False)
        ):
            save_dir = Path(
                flagging_dir
            ) / client_utils.strip_invalid_filename_characters(
                getattr(component, "label", None) or f"component {idx}"
            )
            if utils.is_prop_update(sample):
                csv_data.append(str(sample))
            else:
                data = (
                    component.flag(sample, flag_dir=save_dir)
                    if sample is not None
                    else ""
                )
                if self.simplify_file_data:
                    data = utils.simplify_file_data_in_str(data)
                csv_data.append(data)
        csv_data.append(flag_option)
        csv_data.append(username if username is not None else "")
        csv_data.append(str(datetime.datetime.now()))

        with open(log_filepath, "a", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            if is_new:
                writer.writerow(utils.sanitize_list_for_csv(headers))
            writer.writerow(utils.sanitize_list_for_csv(csv_data))

        with open(log_filepath, encoding="utf-8") as csvfile:
            line_count = len(list(csv.reader(csvfile))) - 1
        return line_count


@document()
class CSVLogger(FlaggingCallback):
    """
    The default implementation of the FlaggingCallback abstract class in gradio>=5.0. Each flagged
    sample (both the input and output data) is logged to a CSV file with headers on the machine running
    the gradio app. Unlike ClassicCSVLogger, this implementation is concurrent-safe and it creates a new
    dataset file every time the headers of the CSV (derived from the labels of the components) change. It also
    only creates columns for "username" and "flag" if the flag_option and username are provided, respectively.

    Example:
        import gradio as gr
        def image_classifier(inp):
            return {'cat': 0.3, 'dog': 0.7}
        demo = gr.Interface(fn=image_classifier, inputs="image", outputs="label",
                            flagging_callback=CSVLogger())
    Guides: using-flagging
    """

    def __init__(
        self,
        simplify_file_data: bool = True,
        verbose: bool = True,
        dataset_file_name: str | None = None,
    ):
        """
        Parameters:
            simplify_file_data: If True, the file data will be simplified before being written to the CSV file. If CSVLogger is being used to cache examples, this is set to False to preserve the original FileData class
            verbose: If True, prints messages to the console about the dataset file creation
            dataset_file_name: The name of the dataset file to be created (should end in ".csv"). If None, the dataset file will be named "dataset1.csv" or the next available number.
        """
        self.simplify_file_data = simplify_file_data
        self.verbose = verbose
        self.dataset_file_name = dataset_file_name
        self.lock = (
            Lock() if not wasm_utils.IS_WASM else contextlib.nullcontext()
        )  # The multiprocessing module doesn't work on Lite.

    def setup(
        self,
        components: Sequence[Component],
        flagging_dir: str | Path,
    ):
        self.components = components
        self.flagging_dir = Path(flagging_dir)
        self.first_time = True

    def _create_dataset_file(self, additional_headers: list[str] | None = None):
        os.makedirs(self.flagging_dir, exist_ok=True)

        if additional_headers is None:
            additional_headers = []
        headers = (
            [
                getattr(component, "label", None) or f"component {idx}"
                for idx, component in enumerate(self.components)
            ]
            + additional_headers
            + [
                "timestamp",
            ]
        )
        headers = utils.sanitize_list_for_csv(headers)
        dataset_files = list(Path(self.flagging_dir).glob("dataset*.csv"))

        if self.dataset_file_name:
            self.dataset_filepath = self.flagging_dir / self.dataset_file_name
        elif dataset_files:
            try:
                latest_file = max(
                    dataset_files, key=lambda f: int(re.findall(r"\d+", f.stem)[0])
                )
                latest_num = int(re.findall(r"\d+", latest_file.stem)[0])

                with open(latest_file, newline="", encoding="utf-8") as csvfile:
                    reader = csv.reader(csvfile)
                    existing_headers = next(reader, None)

                if existing_headers != headers:
                    new_num = latest_num + 1
                    self.dataset_filepath = self.flagging_dir / f"dataset{new_num}.csv"
                else:
                    self.dataset_filepath = latest_file
            except Exception:
                self.dataset_filepath = self.flagging_dir / "dataset1.csv"
        else:
            self.dataset_filepath = self.flagging_dir / "dataset1.csv"

        if not Path(self.dataset_filepath).exists():
            with open(
                self.dataset_filepath, "w", newline="", encoding="utf-8"
            ) as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(utils.sanitize_list_for_csv(headers))
            if self.verbose:
                print("Created dataset file at:", self.dataset_filepath)
        elif self.verbose:
            print("Using existing dataset file at:", self.dataset_filepath)

    def flag(
        self,
        flag_data: list[Any],
        flag_option: str | None = None,
        username: str | None = None,
    ) -> int:
        if self.first_time:
            additional_headers = []
            if flag_option is not None:
                additional_headers.append("flag")
            if username is not None:
                additional_headers.append("username")
            self._create_dataset_file(additional_headers=additional_headers)
            self.first_time = False

        csv_data = []
        for idx, (component, sample) in enumerate(
            zip(self.components, flag_data, strict=False)
        ):
            save_dir = (
                self.flagging_dir
                / client_utils.strip_invalid_filename_characters(
                    getattr(component, "label", None) or f"component {idx}"
                )
            )
            if utils.is_prop_update(sample):
                csv_data.append(str(sample))
            else:
                data = (
                    component.flag(sample, flag_dir=save_dir)
                    if sample is not None
                    else ""
                )
                if self.simplify_file_data:
                    data = utils.simplify_file_data_in_str(data)
                csv_data.append(data)

        if flag_option is not None:
            csv_data.append(flag_option)
        if username is not None:
            csv_data.append(username)
        csv_data.append(str(datetime.datetime.now()))

        with self.lock:
            with open(
                self.dataset_filepath, "a", newline="", encoding="utf-8"
            ) as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(utils.sanitize_list_for_csv(csv_data))
            with open(self.dataset_filepath, encoding="utf-8") as csvfile:
                line_count = len(list(csv.reader(csvfile))) - 1

        return line_count


class FlagMethod:
    """
    Helper class that contains the flagging options and calls the flagging method. Also
    provides visual feedback to the user when flag is clicked.
    """

    def __init__(
        self,
        flagging_callback: FlaggingCallback,
        label: str,
        value: str | None,
        visual_feedback: bool = True,
    ):
        self.flagging_callback = flagging_callback
        self.label = label
        self.value = value
        self.__name__ = "Flag"
        self.visual_feedback = visual_feedback

    def __call__(self, request: gr.Request, *flag_data):
        try:
            self.flagging_callback.flag(
                list(flag_data), flag_option=self.value, username=request.username
            )
        except Exception as e:
            print(f"Error while flagging: {e}")
            if self.visual_feedback:
                return "Error!"
        if not self.visual_feedback:
            return
        time.sleep(0.8)  # to provide enough time for the user to observe button change
        return self.reset()

    def reset(self):
        return gr.Button(value=self.label, interactive=True)

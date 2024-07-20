from __future__ import annotations

import csv
import datetime
import os
import time
from abc import ABC, abstractmethod
from pathlib import Path
from typing import TYPE_CHECKING, Any, Sequence

from gradio_client import utils as client_utils
from gradio_client.documentation import document

import gradio as gr
from gradio import utils

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
        flag_option: str = "",
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
        flag_option: str = "",  # noqa: ARG002
        username: str | None = None,  # noqa: ARG002
    ) -> int:
        flagging_dir = self.flagging_dir
        log_filepath = Path(flagging_dir) / "log.csv"

        csv_data = []
        for component, sample in zip(self.components, flag_data):
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
class CSVLogger(FlaggingCallback):
    """
    The default implementation of the FlaggingCallback abstract class. Each flagged
    sample (both the input and output data) is logged to a CSV file with headers on the machine running the gradio app.
    Example:
        import gradio as gr
        def image_classifier(inp):
            return {'cat': 0.3, 'dog': 0.7}
        demo = gr.Interface(fn=image_classifier, inputs="image", outputs="label",
                            flagging_callback=CSVLogger())
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
        flag_option: str = "",
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
        for idx, (component, sample) in enumerate(zip(self.components, flag_data)):
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


class FlagMethod:
    """
    Helper class that contains the flagging options and calls the flagging method. Also
    provides visual feedback to the user when flag is clicked.
    """

    def __init__(
        self,
        flagging_callback: FlaggingCallback,
        label: str,
        value: str,
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

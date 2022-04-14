from __future__ import annotations

import csv
import datetime
import io
import json
import os
from abc import ABC, abstractmethod
from typing import Any, List, Optional

import gradio as gr
from gradio import encryptor, utils


class FlaggingCallback(ABC):
    """
    An abstract class for defining the methods that any FlaggingCallback should have.
    """

    @abstractmethod
    def setup(self, flagging_dir: str):
        """
        This method should be overridden and ensure that everything is set up correctly for flag().
        This method gets called once at the beginning of the Interface.launch() method.
        Parameters:
        flagging_dir: A string, typically containing the path to the directory where the flagging file should be storied (provided as an argument to Interface.__init__()).
        """
        pass

    @abstractmethod
    def flag(
        self,
        interface: gr.Interface,
        input_data: List[Any],
        output_data: List[Any],
        flag_option: Optional[str] = None,
        flag_index: Optional[int] = None,
        username: Optional[str] = None,
    ) -> int:
        """
        This method should be overridden by the FlaggingCallback subclass and may contain optional additional arguments.
        This gets called every time the <flag> button is pressed.
        Parameters:
        interface: The Interface object that is being used to launch the flagging interface.
        input_data: The input data to be flagged.
        output_data: The output data to be flagged.
        flag_option (optional): In the case that flagging_options are provided, the flag option that is being used.
        flag_index (optional): The index of the sample that is being flagged.
        username (optional): The username of the user that is flagging the data, if logged in.
        Returns:
        (int) The total number of samples that have been flagged.
        """
        pass


class SimpleCSVLogger(FlaggingCallback):
    """
    A simple example implementation of the FlaggingCallback abstract class
    provided for illustrative purposes.
    """

    def setup(self, flagging_dir: str):
        self.flagging_dir = flagging_dir
        os.makedirs(flagging_dir, exist_ok=True)

    def flag(
        self,
        interface: gr.Interface,
        input_data: List[Any],
        output_data: List[Any],
        flag_option: Optional[str] = None,
        flag_index: Optional[int] = None,
        username: Optional[str] = None,
    ) -> int:
        flagging_dir = self.flagging_dir
        log_filepath = "{}/log.csv".format(flagging_dir)

        csv_data = []
        for i, input in enumerate(interface.input_components):
            csv_data.append(
                input.save_flagged(
                    flagging_dir,
                    interface.config["input_components"][i]["label"],
                    input_data[i],
                    None,
                )
            )
        for i, output in enumerate(interface.output_components):
            csv_data.append(
                output.save_flagged(
                    flagging_dir,
                    interface.config["output_components"][i]["label"],
                    output_data[i],
                    None,
                )
                if output_data[i] is not None
                else ""
            )

        with open(log_filepath, "a", newline="") as csvfile:
            writer = csv.writer(csvfile, quoting=csv.QUOTE_NONNUMERIC, quotechar="'")
            writer.writerow(csv_data)

        with open(log_filepath, "r") as csvfile:
            line_count = len([None for row in csv.reader(csvfile)]) - 1
        return line_count


class CSVLogger(FlaggingCallback):
    """
    The default implementation of the FlaggingCallback abstract class.
    Logs the input and output data to a CSV file. Supports encryption.
    """

    def setup(self, flagging_dir: str):
        self.flagging_dir = flagging_dir
        os.makedirs(flagging_dir, exist_ok=True)

    def flag(
        self,
        interface: gr.Interface,
        input_data: List[Any],
        output_data: List[Any],
        flag_option: Optional[str] = None,
        flag_index: Optional[int] = None,
        username: Optional[str] = None,
    ) -> int:
        flagging_dir = self.flagging_dir
        log_fp = "{}/log.csv".format(flagging_dir)
        encryption_key = interface.encryption_key if interface.encrypt else None
        is_new = not os.path.exists(log_fp)
        output_only_mode = input_data is None

        if flag_index is None:
            csv_data = []
            if not output_only_mode:
                for i, input in enumerate(interface.input_components):
                    csv_data.append(
                        input.save_flagged(
                            flagging_dir,
                            interface.config["input_components"][i]["label"],
                            input_data[i],
                            encryption_key,
                        )
                    )
            for i, output in enumerate(interface.output_components):
                csv_data.append(
                    output.save_flagged(
                        flagging_dir,
                        interface.config["output_components"][i]["label"],
                        output_data[i],
                        encryption_key,
                    )
                    if output_data[i] is not None
                    else ""
                )
            if not output_only_mode:
                if flag_option is not None:
                    csv_data.append(flag_option)
                if username is not None:
                    csv_data.append(username)
                csv_data.append(str(datetime.datetime.now()))
            if is_new:
                headers = []
                if not output_only_mode:
                    headers += [
                        interface["label"]
                        for interface in interface.config["input_components"]
                    ]
                headers += [
                    interface["label"]
                    for interface in interface.config["output_components"]
                ]
                if not output_only_mode:
                    if interface.flagging_options is not None:
                        headers.append("flag")
                    if username is not None:
                        headers.append("username")
                    headers.append("timestamp")

        def replace_flag_at_index(file_content):
            file_content = io.StringIO(file_content)
            content = list(csv.reader(file_content))
            header = content[0]
            flag_col_index = header.index("flag")
            content[flag_index][flag_col_index] = flag_option
            output = io.StringIO()
            writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC, quotechar="'")
            writer.writerows(content)
            return output.getvalue()

        if interface.encrypt:
            output = io.StringIO()
            if not is_new:
                with open(log_fp, "rb") as csvfile:
                    encrypted_csv = csvfile.read()
                    decrypted_csv = encryptor.decrypt(
                        interface.encryption_key, encrypted_csv
                    )
                    file_content = decrypted_csv.decode()
                    if flag_index is not None:
                        file_content = replace_flag_at_index(file_content)
                    output.write(file_content)
            writer = csv.writer(output, quoting=csv.QUOTE_NONNUMERIC, quotechar="'")
            if flag_index is None:
                if is_new:
                    writer.writerow(headers)
                writer.writerow(csv_data)
            with open(log_fp, "wb") as csvfile:
                csvfile.write(
                    encryptor.encrypt(
                        interface.encryption_key, output.getvalue().encode()
                    )
                )
        else:
            if flag_index is None:
                with open(log_fp, "a", newline="") as csvfile:
                    writer = csv.writer(
                        csvfile, quoting=csv.QUOTE_NONNUMERIC, quotechar="'"
                    )
                    if is_new:
                        writer.writerow(headers)
                    writer.writerow(csv_data)
            else:
                with open(log_fp) as csvfile:
                    file_content = csvfile.read()
                    file_content = replace_flag_at_index(file_content)
                with open(
                    log_fp, "w", newline=""
                ) as csvfile:  # newline parameter needed for Windows
                    csvfile.write(file_content)
        with open(log_fp, "r") as csvfile:
            line_count = len([None for row in csv.reader(csvfile)]) - 1
        return line_count


class HuggingFaceDatasetSaver(FlaggingCallback):
    """
    A FlaggingCallback that saves flagged data to a HuggingFace dataset.
    """

    def __init__(
        self,
        hf_foken: str,
        dataset_name: str,
        organization: Optional[str] = None,
        private: bool = False,
        verbose: bool = True,
    ):
        """
        Params:
        hf_token (str): The token to use to access the huggingface API.
        dataset_name (str): The name of the dataset to save the data to, e.g.
            "image-classifier-1"
        organization (str): The name of the organization to which to attach
            the datasets. If None, the dataset attaches to the user only.
        private (bool): If the dataset does not already exist, whether it
            should be created as a private dataset or public. Private datasets
            may require paid huggingface.co accounts
        verbose (bool): Whether to print out the status of the dataset
            creation.
        """
        self.hf_foken = hf_foken
        self.dataset_name = dataset_name
        self.organization_name = organization
        self.dataset_private = private
        self.verbose = verbose

    def setup(self, flagging_dir: str):
        """
        Params:
        flagging_dir (str): local directory where the dataset is cloned,
        updated, and pushed from.
        """
        try:
            import huggingface_hub
        except (ImportError, ModuleNotFoundError):
            raise ImportError(
                "Package `huggingface_hub` not found is needed "
                "for HuggingFaceDatasetSaver. Try 'pip install huggingface_hub'."
            )
        path_to_dataset_repo = huggingface_hub.create_repo(
            name=self.dataset_name,
            token=self.hf_foken,
            private=self.dataset_private,
            repo_type="dataset",
            exist_ok=True,
        )
        self.path_to_dataset_repo = path_to_dataset_repo  # e.g. "https://huggingface.co/datasets/abidlabs/test-audio-10"
        self.flagging_dir = flagging_dir
        self.dataset_dir = os.path.join(flagging_dir, self.dataset_name)
        self.repo = huggingface_hub.Repository(
            local_dir=self.dataset_dir,
            clone_from=path_to_dataset_repo,
            use_auth_token=self.hf_foken,
        )
        self.repo.git_pull()

        # Should filename be user-specified?
        self.log_file = os.path.join(self.dataset_dir, "data.csv")
        self.infos_file = os.path.join(self.dataset_dir, "dataset_infos.json")

    def flag(
        self,
        interface: gr.Interface,
        input_data: List[Any],
        output_data: List[Any],
        flag_option: Optional[str] = None,
        flag_index: Optional[int] = None,
        username: Optional[str] = None,
    ) -> int:
        is_new = not os.path.exists(self.log_file)
        infos = {"flagged": {"features": {}}}

        with open(self.log_file, "a", newline="") as csvfile:
            writer = csv.writer(csvfile)

            # File previews for certain input and output types
            file_preview_types = {
                gr.inputs.Audio: "Audio",
                gr.outputs.Audio: "Audio",
                gr.inputs.Image: "Image",
                gr.outputs.Image: "Image",
            }

            # Generate the headers and dataset_infos
            if is_new:
                headers = []

                for i, component in enumerate(interface.input_components):
                    component_label = interface.config["input_components"][i][
                        "label"
                    ] or "input_{}".format(i)
                    headers.append(component_label)
                    infos["flagged"]["features"][component_label] = {
                        "dtype": "string",
                        "_type": "Value",
                    }
                    if isinstance(component, tuple(file_preview_types)):
                        headers.append(component_label + " file")
                        for _component, _type in file_preview_types.items():
                            if isinstance(component, _component):
                                infos["flagged"]["features"][
                                    component_label + " file"
                                ] = {"_type": _type}
                                break

                for i, component in enumerate(interface.output_components):
                    component_label = interface.config["output_components"][i][
                        "label"
                    ] or "output_{}".format(i)
                    headers.append(component_label)
                    infos["flagged"]["features"][component_label] = {
                        "dtype": "string",
                        "_type": "Value",
                    }
                    if isinstance(component, tuple(file_preview_types)):
                        headers.append(component_label + " file")
                        for _component, _type in file_preview_types.items():
                            if isinstance(component, _component):
                                infos["flagged"]["features"][
                                    component_label + " file"
                                ] = {"_type": _type}
                                break

                if interface.flagging_options is not None:
                    headers.append("flag")
                    infos["flagged"]["features"]["flag"] = {
                        "dtype": "string",
                        "_type": "Value",
                    }

                writer.writerow(headers)

            # Generate the row corresponding to the flagged sample
            csv_data = []
            for i, component in enumerate(interface.input_components):
                label = interface.config["input_components"][i][
                    "label"
                ] or "input_{}".format(i)
                filepath = component.save_flagged(
                    self.dataset_dir, label, input_data[i], None
                )
                csv_data.append(filepath)
                if isinstance(component, tuple(file_preview_types)):
                    csv_data.append(
                        "{}/resolve/main/{}".format(self.path_to_dataset_repo, filepath)
                    )
            for i, component in enumerate(interface.output_components):
                label = interface.config["output_components"][i][
                    "label"
                ] or "output_{}".format(i)
                filepath = (
                    component.save_flagged(
                        self.dataset_dir, label, output_data[i], None
                    )
                    if output_data[i] is not None
                    else ""
                )
                csv_data.append(filepath)
                if isinstance(component, tuple(file_preview_types)):
                    csv_data.append(
                        "{}/resolve/main/{}".format(self.path_to_dataset_repo, filepath)
                    )
            if flag_option is not None:
                csv_data.append(flag_option)

            writer.writerow(csv_data)

        if is_new:
            json.dump(infos, open(self.infos_file, "w"))

        with open(self.log_file, "r") as csvfile:
            line_count = len([None for row in csv.reader(csvfile)]) - 1

        self.repo.push_to_hub(commit_message="Flagged sample #{}".format(line_count))

        return line_count

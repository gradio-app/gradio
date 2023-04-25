from __future__ import annotations

import csv
import datetime
import json
import os
import time
import uuid
import warnings
from abc import ABC, abstractmethod
from distutils.version import StrictVersion
from pathlib import Path
from typing import TYPE_CHECKING, Any, List

import filelock
import pkg_resources
from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group

import gradio as gr
from gradio import utils

if TYPE_CHECKING:
    from gradio.components import IOComponent

set_documentation_group("flagging")


# def _get_dataset_features(components: List[IOComponent]):
#     """
#     Takes in a list of components and returns a dataset features info.

#     Parameters:
#     components: list of components

#     Returns:
#     infos: a dictionary of the dataset features
#     header: list of header strings
#     """
#     # Generate the dataset headers and features
#     features = {}
#     for component in components:
#         label = component.label or ""
#         features[label] = {"dtype": "string", "_type": "Value"}

#         # Add file preview if applicable
#         if isinstance(component, tuple(FILE_PREVIEW_TYPES)):
#             for _component, _type in FILE_PREVIEW_TYPES.items():
#                 if isinstance(component, _component):
#                     features[label + " file"] = {"_type": _type}
#                     break
#     features["flag"] = {"dtype": "string", "_type": "Value"}

#     headers = list(features.keys())  # keys are ordered in Python
#     infos = {"flagged": {"features": {}}}
#     return headers, infos


class FlaggingCallback(ABC):
    """
    An abstract class for defining the methods that any FlaggingCallback should have.
    """

    @abstractmethod
    def setup(self, components: List[IOComponent], flagging_dir: str):
        """
        This method should be overridden and ensure that everything is set up correctly for flag().
        This method gets called once at the beginning of the Interface.launch() method.
        Parameters:
        components: Set of components that will provide flagged data.
        flagging_dir: A string, typically containing the path to the directory where the flagging file should be storied (provided as an argument to Interface.__init__()).
        """
        pass

    @abstractmethod
    def flag(
        self,
        flag_data: List[Any],
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

    def setup(self, components: List[IOComponent], flagging_dir: str | Path):
        self.components = components
        self.flagging_dir = flagging_dir
        os.makedirs(flagging_dir, exist_ok=True)

    def flag(
        self,
        flag_data: List[Any],
        flag_option: str = "",
        username: str | None = None,
    ) -> int:
        flagging_dir = self.flagging_dir
        log_filepath = Path(flagging_dir) / "log.csv"

        csv_data = []
        for component, sample in zip(self.components, flag_data):
            save_dir = Path(
                flagging_dir
            ) / client_utils.strip_invalid_filename_characters(component.label or "")
            csv_data.append(
                component.deserialize(
                    sample,
                    save_dir,
                    None,
                )
            )

        with open(log_filepath, "a", newline="") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(utils.sanitize_list_for_csv(csv_data))

        with open(log_filepath, "r") as csvfile:
            line_count = len([None for row in csv.reader(csvfile)]) - 1
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
    Guides: using_flagging
    """

    def __init__(self):
        pass

    def setup(
        self,
        components: List[IOComponent],
        flagging_dir: str | Path,
    ):
        self.components = components
        self.flagging_dir = flagging_dir
        os.makedirs(flagging_dir, exist_ok=True)

    def flag(
        self,
        flag_data: List[Any],
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
            if utils.is_update(sample):
                csv_data.append(str(sample))
            else:
                csv_data.append(
                    component.deserialize(sample, save_dir=save_dir)
                    if sample is not None
                    else ""
                )
        csv_data.append(flag_option)
        csv_data.append(username if username is not None else "")
        csv_data.append(str(datetime.datetime.now()))

        with open(log_filepath, "a", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            if is_new:
                writer.writerow(utils.sanitize_list_for_csv(headers))
            writer.writerow(utils.sanitize_list_for_csv(csv_data))

        with open(log_filepath, "r", encoding="utf-8") as csvfile:
            line_count = len([None for row in csv.reader(csvfile)]) - 1
        return line_count


@document()
class HuggingFaceDatasetSaver(FlaggingCallback):
    """
    A callback that saves each flagged sample (both the input and output data) to a HuggingFace dataset.

    Example:

    ```python
    import gradio as gr

    hf_writer = gr.HuggingFaceDatasetSaver(HF_API_TOKEN, "image-classification-mistakes")

    def image_classifier(inp):
        return {'cat': 0.3, 'dog': 0.7}

    demo = gr.Interface(fn=image_classifier, inputs="image", outputs="label", allow_flagging="manual", flagging_callback=hf_writer)
    demo.launch()
    ```

    Guides: using_flagging
    """

    def __init__(
        self,
        hf_token: str,
        dataset_name: str,
        organization: str | None = None,
        private: bool = False,
        info_filename: str = "dataset_info.json",
        separate_dirs: bool = False,
        verbose: bool = True,  # silently ignored. TODO: remove it?
    ):
        """
        Parameters:
            hf_token: The HuggingFace token to use to create (and write the flagged sample to) the HuggingFace dataset (defaults to the registered one).
            dataset_name: The repo_id of the dataset to save the data to, e.g. "image-classifier-1" or "username/image-classifier-1".
            organization: Deprecated argument. Please pass a full dataset id (e.g. 'username/dataset_name') to `dataset_name` instead.
            private: Whether the dataset should be private (defaults to False).
            info_filename: The name of the file to save the dataset info (defaults to "dataset_infos.json").
            separate_dirs: If True, each flagged item will be saved in a separate directory. This makes the flagging more robust to concurrent editing, but may be less convenient to use.
        """
        if organization is not None:
            warnings.warn(
                "Parameter `organization` is not used anymore. Please pass a full dataset id (e.g. 'username/dataset_name') to `dataset_name` instead."
            )
        self.hf_token = hf_token
        self.dataset_id = dataset_name  # TODO: rename parameter (but ensure backward compatibility somehow)
        self.dataset_private = private
        self.info_filename = info_filename
        self.separate_dirs = separate_dirs

    def setup(self, components: List[IOComponent], flagging_dir: str):
        """
        Params:
        flagging_dir (str): local directory where the dataset is cloned,
        updated, and pushed from.
        """
        try:
            import huggingface_hub
        except (ImportError, ModuleNotFoundError):
            raise ImportError(
                "Package `huggingface_hub` not found is needed for SaferHuggingFaceDatasetSaver. Try 'pip install huggingface_hub'."
            )
        hh_version = pkg_resources.get_distribution("huggingface_hub").version
        try:
            if StrictVersion(hh_version) < StrictVersion("0.12.0"):
                raise ImportError(
                    "The `huggingface_hub` package must be version 0.12.0 or higher"
                    "for HuggingFaceDatasetSaver. Try 'pip install huggingface_hub --upgrade'."
                )
        except ValueError:
            pass

        # Setup dataset on the Hub
        self.dataset_id = huggingface_hub.create_repo(
            repo_id=self.dataset_id,
            token=self.hf_token,
            private=self.dataset_private,
            repo_type="dataset",
            exist_ok=True,
        ).repo_id

        # Setup flagging dir
        self.components = components
        self.dataset_dir = (
            Path(flagging_dir).absolute() / self.dataset_id.split("/")[-1]
        )
        self.dataset_dir.mkdir(parents=True, exist_ok=True)
        self.infos_file = self.dataset_dir / self.info_filename

        # Download remote files to local
        remote_files = [self.info_filename]
        if not self.separate_dirs:
            # No separate dirs => means all data is in the same CSV file => download it to get its current content
            remote_files.append("data.csv")

        for filename in remote_files:
            try:
                huggingface_hub.hf_hub_download(
                    repo_id=self.dataset_id,
                    repo_type="dataset",
                    filename=filename,
                    local_dir=self.dataset_dir,
                    token=self.hf_token,
                )
            except huggingface_hub.utils.EntryNotFoundError:
                pass

    def flag(self, flag_data: List[Any], flag_option: str = "") -> int:
        if self.separate_dirs:
            # Unique CSV file
            unique_id = str(uuid.uuid4())
            components_dir = self.dataset_dir / str(uuid.uuid4())
            data_file = components_dir / "metadata.jsonl"
            path_in_repo = unique_id  # upload in sub folder (safer for concurrency)
        else:
            # JSONL files to support dataset preview on the Hub
            components_dir = self.dataset_dir
            data_file = components_dir / "data.csv"
            path_in_repo = None  # upload at root level

        self._flag_in_dir(
            data_file=data_file,
            components_dir=components_dir,
            path_in_repo=path_in_repo,
            flag_data=flag_data,
            flag_option=flag_option,
        )

    def _flag_in_dir(
        self,
        data_file: Path,
        components_dir: Path,
        path_in_repo: str | None,
        flag_data: List[Any],
        flag_option: str = "",
    ) -> int:
        import huggingface_hub

        # Deserialize components (write images/audio to files)
        features, row = self._deserialize_components(
            components_dir, flag_data, flag_option
        )

        # Write generic info to dataset_infos.json + upload
        with filelock.FileLock(str(self.infos_file) + ".lock"):
            if not self.infos_file.exists():
                self.infos_file.write_text(
                    json.dumps({"flagged": {"features": features}})
                )

                huggingface_hub.upload_file(
                    repo_id=self.dataset_id,
                    repo_type="dataset",
                    token=self.hf_token,
                    path_in_repo=self.infos_file.name,
                    path_or_fileobj=self.infos_file,
                )

        # Write data + upload
        with filelock.FileLock(components_dir / ".lock"):
            headers = list(features.keys())

            if data_file.suffix == ".csv":
                sample_name = self._save_as_csv(data_file, headers=headers, row=row)
            else:
                # JSONL file
                sample_name = self._save_as_jsonl(data_file, headers=headers, row=row)

            huggingface_hub.upload_folder(
                repo_id=self.dataset_id,
                repo_type="dataset",
                commit_message=f"Flagged sample #{sample_name}",
                path_in_repo=path_in_repo,
                ignore_patterns="*.lock",
                folder_path=components_dir,
                token=self.hf_token,
            )

    @staticmethod
    def _save_as_csv(data_file: Path, headers: List[str], row: List[Any]) -> str:
        """Save data as CSV and return the sample name (row number)."""
        is_new = not data_file.exists()

        with data_file.open("a", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)

            # Write CSV headers if new file
            if is_new:
                writer.writerow(utils.sanitize_list_for_csv(headers))

            # Write CSV row for flagged sample
            writer.writerow(utils.sanitize_list_for_csv(row))

        with data_file.open(encoding="utf-8") as csvfile:
            return sum(1 for _ in csv.reader(csvfile)) - 1

    @staticmethod
    def _save_as_jsonl(data_file: Path, headers: List[str], row: List[Any]) -> str:
        """Save data as JSONL and return the sample name (uuid)."""
        data_file.write_text(
            json.dumps({header: item for header, item in zip(headers, row)}),
        )
        return data_file.parent.name

    def _deserialize_components(
        self, data_dir: Path, flag_data: List[Any], flag_option: str = ""
    ) -> List[Any]:
        """Deserialize components and return the corresponding row for the flagged sample.

        Images/audio are saved to disk as individual files.
        """
        import huggingface_hub

        # Components that can have a preview on dataset repos
        # NOTE: not at root level to avoid circular imports
        FILE_PREVIEW_TYPES = {gr.Audio: "Audio", gr.Image: "Image"}

        # Generate the row corresponding to the flagged sample
        features = {}
        row = []
        for component, sample in zip(self.components, flag_data):
            # Get deserialized object (will save sample to disk if applicable -file, audio, image,...-)
            label = component.label or ""
            save_dir = data_dir / client_utils.strip_invalid_filename_characters(label)
            deserialized = component.deserialize(sample, save_dir, None)

            # Add deserialized object to row
            features[label] = {"dtype": "string", "_type": "Value"}
            row.append(deserialized)

            # If component is eligible for a preview, add the URL of the file
            if isinstance(component, tuple(FILE_PREVIEW_TYPES)):
                for _component, _type in FILE_PREVIEW_TYPES.items():
                    if isinstance(component, _component):
                        features[label + " file"] = {"_type": _type}
                        break
                path_in_repo = str(  # returned filepath is absolute, we want it relative to compute URL
                    Path(deserialized).relative_to(self.dataset_dir)
                )
                row.append(
                    huggingface_hub.hf_hub_url(
                        repo_id=self.dataset_id,
                        filename=path_in_repo,
                        repo_type="dataset",
                    )
                )
        features["flag"] = {"dtype": "string", "_type": "Value"}
        row.append(flag_option)
        return features, row

    # def _flag_thread_safe(self, flag_data: List[Any], flag_option: str = "") -> int:
    #     import huggingface_hub

    #     is_new = not self.log_file.exists()

    #     with self.log_file.open("a", newline="", encoding="utf-8") as csvfile:
    #         writer = csv.writer(csvfile)

    #         # File previews for certain input and output types
    #         infos, file_preview_types, headers = _get_dataset_features_info(
    #             is_new, self.components
    #         )

    #         # Generate the headers and dataset_infos
    #         if is_new:
    #             writer.writerow(utils.sanitize_list_for_csv(headers))

    #         # Generate the row corresponding to the flagged sample
    #         csv_data = []
    #         for component, sample in zip(self.components, flag_data):
    #             save_dir = (
    #                 self.dataset_dir
    #                 / client_utils.strip_invalid_filename_characters(
    #                     component.label or ""
    #                 )
    #             )
    #             filepath = component.deserialize(sample, save_dir, None)
    #             csv_data.append(filepath)
    #             if isinstance(component, tuple(file_preview_types)):
    #                 csv_data.append(
    #                     huggingface_hub.hf_hub_url(
    #                         repo_id=self.dataset_id,
    #                         filename=filepath,
    #                         repo_type="dataset",
    #                     )
    #                 )
    #         csv_data.append(flag_option)
    #         writer.writerow(utils.sanitize_list_for_csv(csv_data))

    #     huggingface_hub.upload_folder(
    #         repo_id=self.dataset_id,
    #         repo_type="dataset",
    #         commit_message=f"Flagged sample #{sample_nb}",
    #         ignore_patterns="*.lock",
    #         folder_path=self.dataset_dir,
    #         token=self.hf_token,
    #     )


class HuggingFaceDatasetJSONSaver(HuggingFaceDatasetSaver):
    def __init__(
        self,
        hf_token: str,
        dataset_name: str,
        organization: str | None = None,
        private: bool = False,
        info_filename: str = "dataset_info.json",
        separate_dirs: bool = True,
        verbose: bool = True,  # silently ignored. TODO: remove it?
    ):
        if not separate_dirs:
            raise ValueError(
                "`separate_dirs` must be set to `True` for "
                "`HuggingFaceDatasetJSONSaver`. Use `HuggingFaceDatasetSaver` instead."
            )
        warnings.warn(
            "Callback `HuggingFaceDatasetJSONSaver` is deprecated in favor of"
            " `HuggingFaceDatasetSaver` by passing `separate_dirs=True` as parameter."
        )
        super().__init__(
            hf_token=hf_token,
            dataset_name=dataset_name,
            organization=organization,
            private=private,
            info_filename=info_filename,
            separate_dirs=True,
        )

    # def setup(self, components: List[IOComponent], flagging_dir: str):
    #     """
    #     Params:
    #     components List[Component]: list of components for flagging
    #     flagging_dir (str): local directory where the dataset is cloned,
    #     updated, and pushed from.
    #     """
    #     try:
    #         import huggingface_hub
    #     except (ImportError, ModuleNotFoundError):
    #         raise ImportError(
    #             "Package `huggingface_hub` not found is needed "
    #             "for HuggingFaceDatasetJSONSaver. Try 'pip install huggingface_hub'."
    #         )
    #     hh_version = pkg_resources.get_distribution("huggingface_hub").version
    #     try:
    #         if StrictVersion(hh_version) < StrictVersion("0.6.0"):
    #             raise ImportError(
    #                 "The `huggingface_hub` package must be version 0.6.0 or higher"
    #                 "for HuggingFaceDatasetSaver. Try 'pip install huggingface_hub --upgrade'."
    #             )
    #     except ValueError:
    #         pass
    #     repo_id = huggingface_hub.get_full_repo_name(
    #         self.dataset_name, token=self.hf_token
    #     )
    #     path_to_dataset_repo = huggingface_hub.create_repo(
    #         repo_id=repo_id,
    #         token=self.hf_token,
    #         private=self.dataset_private,
    #         repo_type="dataset",
    #         exist_ok=True,
    #     )
    #     self.path_to_dataset_repo = path_to_dataset_repo  # e.g. "https://huggingface.co/datasets/abidlabs/test-audio-10"
    #     self.components = components
    #     self.flagging_dir = flagging_dir
    #     self.dataset_dir = Path(flagging_dir) / self.dataset_name
    #     self.repo = huggingface_hub.Repository(
    #         local_dir=str(self.dataset_dir),
    #         clone_from=path_to_dataset_repo,
    #         use_auth_token=self.hf_token,
    #     )
    #     self.repo.git_pull(lfs=True)

    #     self.infos_file = Path(self.dataset_dir) / "dataset_infos.json"

    # def flag(
    #     self,
    #     flag_data: List[Any],
    #     flag_option: str = "",
    #     username: str | None = None,
    # ) -> str:
    #     self.repo.git_pull(lfs=True)

    #     # Generate unique folder for the flagged sample
    #     unique_name = self.get_unique_name()  # unique name for folder
    #     folder_name = (
    #         Path(self.dataset_dir) / unique_name
    #     )  # unique folder for specific example
    #     os.makedirs(folder_name)

    #     # Now uses the existence of `dataset_infos.json` to determine if new
    #     is_new = not Path(self.infos_file).exists()

    #     # File previews for certain input and output types
    #     infos, file_preview_types, _ = _get_dataset_features_info(
    #         is_new, self.components
    #     )

    #     # Generate the row and header corresponding to the flagged sample
    #     csv_data = []
    #     headers = []

    #     for component, sample in zip(self.components, flag_data):
    #         headers.append(component.label)

    #         try:
    #             save_dir = Path(
    #                 folder_name
    #             ) / client_utils.strip_invalid_filename_characters(
    #                 component.label or ""
    #             )
    #             filepath = component.deserialize(sample, save_dir, None)
    #         except Exception:
    #             # Could not parse 'sample' (mostly) because it was None and `component.save_flagged`
    #             # does not handle None cases.
    #             # for example: Label (line 3109 of components.py raises an error if data is None)
    #             filepath = None

    #         if isinstance(component, tuple(file_preview_types)):
    #             headers.append(component.label or "" + " file")

    #             csv_data.append(
    #                 "{}/resolve/main/{}/{}".format(
    #                     self.path_to_dataset_repo, unique_name, filepath
    #                 )
    #                 if filepath is not None
    #                 else None
    #             )

    #         csv_data.append(filepath)
    #     headers.append("flag")
    #     csv_data.append(flag_option)

    #     # Creates metadata dict from row data and dumps it
    #     metadata_dict = {
    #         header: _csv_data for header, _csv_data in zip(headers, csv_data)
    #     }
    #     self.dump_json(metadata_dict, Path(folder_name) / "metadata.jsonl")

    #     if is_new:
    #         json.dump(infos, open(self.infos_file, "w"))

    #     self.repo.push_to_hub(commit_message="Flagged sample {}".format(unique_name))
    #     return unique_name

    # def get_unique_name(self):
    #     id = uuid.uuid4()
    #     return str(id)

    # def dump_json(self, thing: dict, file_path: str | Path) -> None:
    #     with open(file_path, "w+", encoding="utf8") as f:
    #         json.dump(thing, f)


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

    def __call__(self, *flag_data):
        try:
            self.flagging_callback.flag(list(flag_data), flag_option=self.value)
        except Exception as e:
            print("Error while flagging: {}".format(e))
            if self.visual_feedback:
                return "Error!"
        if not self.visual_feedback:
            return
        time.sleep(0.8)  # to provide enough time for the user to observe button change
        return self.reset()

    def reset(self):
        return gr.Button.update(value=self.label, interactive=True)

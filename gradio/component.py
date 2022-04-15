import os
import shutil
from typing import Any, Dict, Optional

from gradio import processing_utils
from gradio.blocks import Block


class Component(Block):
    """
    A class for defining the methods that all gradio input and output components should have.
    """

    def __init__(self, label, requires_permissions=False):
        self.label = label
        self.requires_permissions = requires_permissions
        super().__init__()

    def __str__(self):
        return self.__repr__()

    def __repr__(self):
        return '{}(label="{}")'.format(type(self).__name__, self.label)

    def get_template_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {"name": self.__class__.__name__.lower(), "label": self.label}

    @classmethod
    def get_shortcut_implementations(cls):
        """
        Return dictionary of shortcut implementations
        """
        return {}

    def save_flagged(
        self, dir: str, label: str, data: Any, encryption_key: bool
    ) -> Any:
        """
        Saves flagged data from component
        """
        return data

    def restore_flagged(self, dir, data, encryption_key):
        """
        Restores flagged data from logs
        """
        return data

    def save_flagged_file(
        self, dir: str, label: str, data: Any, encryption_key: bool,
        file_path: Optional[str] = None,
    ) -> Optional[str]:
        """
        Saved flagged data (e.g. image or audio) as a file and returns filepath
        """
        if data is None:
            return None
        file = processing_utils.decode_base64_to_file(data, encryption_key, file_path)
        label = "".join([char for char in label if char.isalnum() or char in "._- "])
        old_file_name = file.name
        output_dir = os.path.join(dir, label)
        if os.path.exists(output_dir):
            file_index = len(os.listdir(output_dir))
        else:
            os.makedirs(output_dir)
            file_index = 0
        new_file_name = str(file_index)
        if "." in old_file_name:
            uploaded_format = old_file_name.split(".")[-1].lower()
            new_file_name += "." + uploaded_format
        file.close()
        shutil.move(old_file_name, os.path.join(dir, label, new_file_name))
        return label + "/" + new_file_name

    def restore_flagged_file(
        self,
        dir: str,
        file: str,
        encryption_key: bool,
    ) -> Dict[str, Any]:
        """
        Loads flagged data from file and returns it
        """
        data = processing_utils.encode_file_to_base64(
            os.path.join(dir, file), encryption_key=encryption_key
        )
        return {"name": file, "data": data}

    @classmethod
    def get_all_shortcut_implementations(cls):
        shortcuts = {}
        for sub_cls in cls.__subclasses__():
            for shortcut, parameters in sub_cls.get_shortcut_implementations().items():
                shortcuts[shortcut] = (sub_cls, parameters)
        return shortcuts

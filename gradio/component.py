import os
import shutil
from gradio import processing_utils

class Component():
    """
    A class for defining the methods that all gradio input and output components should have.
    """

    def __init__(self, label):
        self.label = label

    def get_template_context(self):
        """
        :return: a dictionary with context variables for the javascript file associated with the context
        """
        return {"label": self.label}

    @classmethod
    def get_shortcut_implementations(cls):
        """
        Return dictionary of shortcut implementations
        """
        return {}

    def save_flagged(self, dir, label, data):
        """
        Saves flagged data from component
        """
        return data

    def restore_flagged(self, data):
        """
        Restores flagged data from logs
        """
        return data

    def save_flagged_file(self, dir, label, data):
        file = processing_utils.decode_base64_to_file(data)
        old_file_name = file.name
        output_dir = os.path.join(dir, label)
        if os.path.exists(output_dir):
            file_index = len(os.listdir(output_dir))
        else:
            os.mkdir(output_dir)
            file_index = 0
        new_file_name = str(file_index)
        if "." in old_file_name:
            uploaded_format = old_file_name.split(".")[-1].lower()
            new_file_name +=  "." + uploaded_format
        shutil.move(old_file_name, os.path.join(dir, label, new_file_name))
        return label + "/" + new_file_name

    @classmethod
    def get_all_shortcut_implementations(cls):
        shortcuts = {}
        for sub_cls in cls.__subclasses__():
            for shortcut, parameters in sub_cls.get_shortcut_implementations().items():
                shortcuts[shortcut] = (sub_cls, parameters)
        return shortcuts

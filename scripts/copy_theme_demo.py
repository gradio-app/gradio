import pathlib
import shutil
from hatchling.builders.hooks.plugin.interface import BuildHookInterface


class CustomBuildHook(BuildHookInterface):

    def initialize(self, version, build_data):
        source_dir = pathlib.Path(self.root, "demo", "blocks_kitchen_sink", "run.py")
        dest_dir = pathlib.Path(
            self.root, "gradio", "themes", "app.py")
        shutil.copy(source_dir, dest_dir)
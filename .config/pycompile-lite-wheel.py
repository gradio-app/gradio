import subprocess

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


class BuildHook(BuildHookInterface):
    def finalize(self, version, build_data, artifact_path):
        subprocess.run(["pyodide", "py-compile", "--keep", artifact_path], check=True)

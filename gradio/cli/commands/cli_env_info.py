""" This file is the part of 'gradio/cli.py' for printing the environment info
for the cli command 'gradio environment'
"""
from __future__ import annotations

import platform
from importlib import metadata

from rich import print


def print_environment_info():
    """Print Gradio environment information."""
    print("Gradio Environment Information:\n------------------------------")
    print("Operating System:", platform.system())

    for package_name in ["gradio", "gradio_client"]:
        try:
            package_version = metadata.version(package_name)
            print(f"{package_name} version:", package_version)
        except metadata.PackageNotFoundError:
            print(f"{package_name} package is not installed.")
    print("\n------------------------------------------------")
    for package_name in ["gradio", "gradio_client"]:
        try:
            dist = metadata.distribution(package_name)
            print(f"{package_name} dependencies in your environment:\n")
            if dist.requires is not None:
                for req in dist.requires:
                    req_base_name = (
                        req.split(">")[0]
                        .split("<")[0]
                        .split("~")[0]
                        .split("[")[0]
                        .split("!")[0]
                    )
                    try:
                        print(f"{req_base_name}: {metadata.version(req_base_name)}")
                    except metadata.PackageNotFoundError:
                        print(f"{req_base_name} is not installed.")
                print("\n")
        except metadata.PackageNotFoundError:
            print(f"{package_name} package is not installed.")

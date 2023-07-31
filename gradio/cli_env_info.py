""" This file is the part of 'gradio/cli.py' for printing the environment info 
for the cli command 'gradio environment'
"""
import platform
from importlib import metadata


def print_environment_info():
    print("Gradio Environment Information:\n------------------------------")
    print("Operating System:", platform.system())

    try:
        for package_name in ["gradio", "gradio_client"]:
            package_version = metadata.version(package_name)
            print(f"{package_name} version:", package_version)
        print("\n------------------------------------------------")
        for package_name in ["gradio", "gradio_client"]:
            print(f"{package_name} dependencies in your environment:\n")
            dist = metadata.distribution(package_name)
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

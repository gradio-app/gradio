""" This file is the part of 'gradio/cli.py' for printing the environment info 
for the cli command 'gradio environment'
"""
import platform

import pkg_resources


def print_environment_info():
    print("Gradio Environment Information:")

    print("Operating System: ", platform.system())
    print("\n")

    for package_name in ["gradio", "gradio_client"]:
        try:
            package_dist = pkg_resources.get_distribution(package_name)
            package_version = package_dist.version
            print(f"{package_name} version: ", package_version)

            print(f"\n{package_name} Dependencies:")
            for req in package_dist.requires():
                print(
                    f"  {req.project_name}: {pkg_resources.get_distribution(req.project_name).version}"
                )

            print("\n")
        except pkg_resources.DistributionNotFound:
            print(f"{package_name} package is not installed.")

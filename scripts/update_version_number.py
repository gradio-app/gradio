import os
import pathlib

def update_version_number():
    if "GITHUB_REF" not in os.environ:
        return
    pr_number = os.environ["GITHUB_REF"].split("/")[2]
    return pr_number
    #version_file = pathlib.Path(pathlib.Path().absolute(), "gradio/version.txt")
    #version_number = open(version_file, "r").readline()
    #with open(version_file, "w") as version:
    #    version.write(f"{version_number}.{pr_number}")
    #return f"{version_number}.{pr_number}"
    

if __name__ == "__main__":
    print(update_version_number())
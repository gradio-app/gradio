import shutil
import os
import pathlib


def copy_all_demos(source_dir: str, dest_dir: str):
    all_demos = []
    for p in os.listdir(source_dir):
        full_dir = os.path.join(source_dir, p)
        is_dir = os.path.isdir(full_dir)
        no_requirements = not os.path.exists(os.path.join(full_dir, "requirements.txt"))
        has_app = os.path.exists(os.path.join(full_dir, "run.py"))
        if is_dir and no_requirements and has_app:
            all_demos.append(p)

    to_exclude = ["blocks_demos", "rows_and_columns", "image_classifier_interface_load", "generate_english_german",
                  "all_demos"]
    all_demos = [d for d in all_demos if d not in to_exclude]

    for demo in all_demos:
        shutil.copytree(os.path.join(source_dir, demo),
                        os.path.join(dest_dir, demo), dirs_exist_ok=True)


if __name__ == "__main__":
    source_dir = pathlib.Path(pathlib.Path(__file__).parent, "..", "demo")
    dest_dir = pathlib.Path(pathlib.Path(__file__).parent, "..", "demo", "all_demos", "demos")
    copy_all_demos(source_dir, dest_dir)
import os
import subprocess
import shutil
import pytest


@pytest.fixture(scope="session", autouse=True)
def build_packages():
    file_dir = os.path.dirname(os.path.abspath(__file__))
    gradio_dir = os.path.dirname(os.path.dirname(file_dir))
    subprocess.run(
        ["python", "-m", "build", "--wheel", gradio_dir, "--outdir", file_dir],
        check=True,
    )
    subprocess.run(
        [
            "python",
            "-m",
            "build",
            "--wheel",
            os.path.join(gradio_dir, "client/python/"),
            "--outdir",
            file_dir,
        ],
        check=True,
    )
    wheel_files = [f for f in os.listdir(file_dir) if f.endswith(".whl")]
    test_folders = [f for f in os.listdir(file_dir) if f.startswith("test_")]

    for test_folder in test_folders:
        test_folder_path = os.path.join(file_dir, test_folder)
        for wheel_file in wheel_files:
            wheel_path = os.path.join(file_dir, wheel_file)
            shutil.copy(wheel_path, test_folder_path)

    yield

    for wheel_file in wheel_files:
        wheel_path = os.path.join(file_dir, wheel_file)
        os.remove(wheel_path)
    for test_folder in test_folders:
        test_folder_path = os.path.join(file_dir, test_folder)
        for wheel_file in wheel_files:
            wheel_path = os.path.join(test_folder_path, wheel_file)
            os.remove(wheel_path)
        


import os
import shutil
import subprocess
import time

import docker
import pytest
import requests
from docker.errors import NotFound
from requests.exceptions import ConnectionError, RequestException


@pytest.fixture(scope="session", autouse=True)
def build_packages():
    file_dir = os.path.dirname(os.path.abspath(__file__))
    gradio_dir = os.path.dirname(os.path.dirname(file_dir))
    try:
        subprocess.run(
            ["python", "-m", "build", "--wheel", gradio_dir, "--outdir", file_dir],
            check=True,
            capture_output=True,
            text=True,
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
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Error during python build: {e.stderr} | {e.stdout}") from e

    wheel_files = [f for f in os.listdir(file_dir) if f.endswith(".whl")]
    test_folders = [
        folder for folder in os.listdir(file_dir) if folder.startswith("test_")
    ]
    for wheel_file in wheel_files:
        for test_folder in test_folders:
            shutil.copy(
                os.path.join(file_dir, wheel_file), os.path.join(file_dir, test_folder)
            )

    yield

    for wheel_file in wheel_files:
        wheel_path = os.path.join(file_dir, wheel_file)
        os.remove(wheel_path)
        for test_folder in test_folders:
            test_wheel_path = os.path.join(file_dir, test_folder, wheel_file)
            if os.path.exists(test_wheel_path):
                os.remove(test_wheel_path)


@pytest.fixture(scope="module")
def launch_services_fn():
    client = docker.from_env()

    def launch_services(
        test_name: str, folder: str, app_suffix: str = "", nginx_suffix: str = ""
    ):
        os.environ["COMPOSE_PROJECT_NAME"] = test_name
        try:
            subprocess.run(
                [
                    "docker",
                    "compose",
                    "-f",
                    f"{folder}/docker-compose.yml",
                    "up",
                    "-d",
                    "--build",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            raise RuntimeError(
                f"Error during docker-compose up: {e.stderr} | {e.stdout}"
            ) from e

        container_attempts = 10

        app_container = None
        nginx_container = None

        while container_attempts > 0:
            try:
                app_container = client.containers.get(f"{test_name}_app")
                nginx_container = client.containers.get(f"{test_name}_nginx")
                print("Successfully connected to both containers")
                break
            except NotFound as e:
                print(f"Waiting for containers to be ready: {e}")
                container_attempts -= 1
                time.sleep(1)
                continue
            except Exception as e:
                print(f"Unexpected error checking containers: {e}")
                raise

        if container_attempts == 0:
            raise TimeoutError("Timed out waiting for containers to be ready")

        if app_container is None or nginx_container is None:
            raise ValueError("Failed to get app or nginx container")

        app_container.reload()
        nginx_container.reload()

        app_port = None
        nginx_port = None

        try:
            app_port = app_container.ports.get("8000/tcp")[0]["HostPort"]  # type: ignore
            nginx_port = nginx_container.ports.get("80/tcp")[0]["HostPort"]  # type: ignore

            app_url = f"http://localhost:{app_port}{app_suffix}"
            nginx_url = f"http://localhost:{nginx_port}{nginx_suffix}"

            print(f"Will check app at: {app_url}")
            print(f"Will check nginx at: {nginx_url}")

            service_attempts = 20
            while service_attempts > 0:
                try:
                    app_response = requests.get(app_url, timeout=2)
                    print(f"App response: {app_response.status_code}")

                    nginx_response = requests.get(nginx_url, timeout=2)
                    print(f"Nginx response: {nginx_response.status_code}")

                    if (
                        app_response.status_code == 200
                        and nginx_response.status_code == 200
                    ):
                        print("Both services are responding with 200 OK")
                        break

                except (ConnectionError, RequestException) as e:
                    print(f"Waiting for services to be ready: {e}")

                service_attempts -= 1
                time.sleep(1)

            if service_attempts == 0:
                raise TimeoutError(
                    "Timed out waiting for services to respond with 200 OK"
                )
        except Exception as e:
            print(f"Error during service check: {e}")
            raise

        yield app_url, nginx_url

        try:
            subprocess.run(
                ["docker", "compose", "-f", f"{folder}/docker-compose.yml", "down"],
                check=True,
            )
        except Exception as e:
            print(f"Error during cleanup: {e}")

    return launch_services

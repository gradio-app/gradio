import pathlib

import pytest


def pytest_configure(config):
    config.addinivalue_line(
        "markers", "flaky: mark test as flaky. Failure will not cause te"
    )


@pytest.fixture
def test_file_dir():
    return pathlib.Path(pathlib.Path(__file__).parent, "test_files")

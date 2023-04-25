def pytest_configure(config):
    config.addinivalue_line(
        "markers", "flaky: mark test as flaky. Failure will not cause te"
    )

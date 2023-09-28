from gradio.route_utils import set_replica_url_in_config


def test_set_replica_url():
    config = {
        "components": [
            {"props": {}},
            {"props": {"root_url": "existing_url/"}},
            {"props": {"root_url": "different_url/"}},
            {},
        ]
    }
    replica_url = "https://abidlabs-test-client-replica--fttzk.hf.space?__theme=light"

    set_replica_url_in_config(config, replica_url, {"existing_url/"})
    assert (
        config["components"][0]["props"]["root_url"]
        == "https://abidlabs-test-client-replica--fttzk.hf.space/"
    )
    assert (
        config["components"][1]["props"]["root_url"]
        == "https://abidlabs-test-client-replica--fttzk.hf.space/"
    )
    assert config["components"][2]["props"]["root_url"] == "different_url/"
    assert "props" not in config["components"][3]


def test_url_without_trailing_slash():
    config = {"components": [{"props": {}}]}
    replica_url = "https://abidlabs-test-client-replica--fttzk.hf.space"

    set_replica_url_in_config(config, replica_url, set())
    assert (
        config["components"][0]["props"]["root_url"]
        == "https://abidlabs-test-client-replica--fttzk.hf.space/"
    )

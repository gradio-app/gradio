import pytest

from gradio import Interface, networking


@pytest.mark.flaky
def test_setup_tunnel():
    io = Interface(lambda x: x, "number", "number")
    io.launch(show_error=True, prevent_thread_lock=True)
    share_url = networking.setup_tunnel(io.server_name, io.server_port, io.share_token)
    assert isinstance(share_url, str)

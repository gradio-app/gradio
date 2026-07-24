"""End-to-end check that a caller-supplied token reaches gr.OAuthToken.

Runs against a real OAuth-enabled Space rather than a mock, because the parts
that broke before were environmental: a Space sits behind a proxy that strips
`x-hf-*` headers, so a token has to travel in the request body to arrive at all.

Flaky by nature — it needs network, a token, and the fixture Space to be awake.
"""

import huggingface_hub
import pytest
from gradio_client import Client

pytestmark = [pytest.mark.flaky, pytest.mark.serial]

# /report takes a gr.OAuthToken and echoes what it received; /calculator does
# not take one. See the Space's run.py.
SPACE = "gradio-tests/test-calculator-1"


def test_oauth_token_reaches_only_the_endpoint_that_asks_for_it():
    token = huggingface_hub.get_token()
    if not token:
        pytest.skip("no Hugging Face token available")

    client = Client(SPACE, token=token, oauth_token=token, verbose=False)
    info = client.view_api(return_format="dict")["named_endpoints"]

    # The app declares which endpoints act on the caller's behalf.
    assert info["/report"]["oauth_token"] == "optional"
    assert "oauth_token" not in info["/calculator"]

    # The token is only placed in the body of the endpoint that declared it.
    payloads = {
        endpoint.api_name: endpoint.oauth_token_payload()
        for endpoint in client.endpoints.values()
        if endpoint.api_name in ("/report", "/calculator")
    }
    assert payloads["/report"] == {"oauth_token": token}
    assert payloads["/calculator"] == {}

    # A usable token arrives, so the Space can act as the caller.
    assert client.predict(api_name="/report").startswith("user:")
    assert client.predict(4, "add", 2, api_name="/calculator") == 6

    # Without oauth_token=, nothing is granted even though `token` authenticates
    # the caller to the Space itself.
    unauthorized = Client(SPACE, token=token, verbose=False)
    assert unauthorized.predict(api_name="/report") == "none"

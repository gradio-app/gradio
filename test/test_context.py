import threading

from gradio.context import LocalContext
from gradio.route_utils import Request


def test_child_thread_inherits_request_context():
    """LocalContext.request should be readable from a child threading.Thread.

    threading.Thread does not inherit ContextVar values, so without the
    _RequestContextVar fallback this test fails with result=None.
    """
    req = Request(username="test_user", session_hash="abc123")
    LocalContext.request.set(req)

    result = [None]

    def child():
        result[0] = LocalContext.request.get(None)

    t = threading.Thread(target=child)
    t.start()
    t.join()

    assert result[0] is req

from gradio.components import Button
from gradio.layouts import Form, Row


def test_form_min_width_guard():
    """
    Test that `Form.add_child` does not crash with a component whose `min_width` is `None`.
    """
    r = Row()
    f = Form()
    f.parent = r
    b = Button()
    f.add_child(b)
    assert f.min_width == 0

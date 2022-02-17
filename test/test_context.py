def test_context():
    from gradio.context import Context
    assert Context.id == 0
    Context.id += 1
    assert Context.id == 1
    Context.root_block = {}
    Context.root_block["1"] = 1
    assert Context.root_block == {"1": 1}

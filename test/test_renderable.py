"""Tests for `gradio.renderable`.

Regression coverage for https://github.com/gradio-app/gradio/issues/12081 --
``@gr.render`` raising ``KeyError`` when the inner render contains a
``gr.Examples`` (which transiently registers and pops a "fake_event" function).
"""

from __future__ import annotations

import gradio as gr
from gradio.context import LocalContext


def test_render_apply_does_not_raise_keyerror_when_fns_are_popped():
    """
    `Renderable.apply` snapshots `fns_from_last_render` *before* running the user
    render function. If the user render function (or anything it calls -- e.g.
    `gr.Examples` -- which transiently appends and then pops a function in
    `gradio/helpers.py`) leaves `blocks_config.fns` without an entry for one of
    the previously-rendered ids, the cleanup loop in `Renderable.apply` must
    treat that absent entry as "already cleaned up" rather than raising.

    Reproduces issue #12081 deterministically without spinning up an HTTP
    server: we capture the renderable, register a placeholder block-function
    that mimics what `gr.Examples` does (a function with the right
    `rendered_in`), then pop it during `apply` and assert no `KeyError`.
    """

    captured = {}

    with gr.Blocks() as demo:
        with gr.Tab(key="tab", label="Tab"):
            dropdown = gr.Dropdown(["a", "b", "c"])

            @gr.render(inputs=[dropdown])
            def _render(value):  # noqa: D401 -- imperative.
                # Mimic the surface that triggered the original report:
                # gr.Examples() inside a render adds and then pops a fn.
                gr.Textbox(key="text", label="Text")
                gr.Examples(
                    examples=["a1", "a2", "a3"],
                    example_labels=["First", "Second", "Third"],
                    inputs=[gr.Textbox(visible=False)],
                )

            # Capture the renderable that `@gr.render` registered so we can
            # call its .apply() directly without going through the queue.
            for renderable in demo.renderables:
                captured["renderable"] = renderable

    renderable = captured["renderable"]

    # Build a fake `BlockFunction` belonging to this renderable, then drop
    # it from `fns` *before* `apply` runs to model the post-Examples state
    # described by the issue. ``apply`` must skip the missing id, not raise.
    blocks_config = demo.default_config

    class _StubBlockFn:
        rendered_in = renderable
        render_iteration = renderable.render_iteration  # current iteration
        _id = max(blocks_config.fns.keys(), default=-1) + 1_000

    stub = _StubBlockFn()
    blocks_config.fns[stub._id] = stub  # type: ignore[assignment]

    # Configure local context so `apply` runs cleanly.
    token = LocalContext.blocks_config.set(blocks_config)
    try:
        # Concurrently pop the stub mid-render to simulate gr.Examples' fake-
        # event cleanup (`gradio/helpers.py:580`).
        original_fn = renderable.fn

        def _user_fn_that_pops(*args, **kwargs):
            blocks_config.fns.pop(stub._id, None)
            return original_fn(*args, **kwargs)

        renderable.fn = _user_fn_that_pops
        try:
            # Should NOT raise KeyError -- this is the fix for #12081.
            renderable.apply("a")
        finally:
            renderable.fn = original_fn
    finally:
        LocalContext.blocks_config.reset(token)

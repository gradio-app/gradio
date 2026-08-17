import gc

import gradio as gr

CONTAINERS_ALLOWED_TO_GROW = {
    "Queue.process_time_per_fn",
    "Queue.event_queue_per_concurrency_id",
    "Queue.active_jobs",
}


def census(owners: dict[str, object]) -> dict[str, int]:
    sizes: dict[str, int] = {}
    for owner_name, owner in owners.items():
        for attr in dir(owner):
            if attr.startswith("__"):
                continue
            try:
                value = getattr(owner, attr)
            except Exception:
                continue
            key = f"{owner_name}.{attr}"
            if (
                isinstance(value, (dict, set, list, frozenset, tuple))
                and key not in CONTAINERS_ALLOWED_TO_GROW
            ):
                sizes[key] = len(value)
    return sizes


class TestServerDoesNotGrowPerRequest:
    """Nothing the server keeps may be larger after a second identical batch of
    requests on the same session. See https://github.com/gradio-app/gradio/issues/11602."""

    def test_no_container_grows_across_identical_batches(self, connect):
        with gr.Blocks() as demo:
            box = gr.Textbox()
            out = gr.Textbox()
            state = gr.State()
            gr.Button("go").click(
                lambda text, _s: (text.upper(), None), [box, state], [out, state]
            )

        with connect(demo) as client:
            demo._queue.ANALYTICS_MAX_EVENTS = 5

            def batch():
                for _ in range(8):
                    client.predict("hello", api_name="/lambda")
                gc.collect()

            owners = {
                "Queue": demo._queue,
                "Blocks": demo,
                "StateHolder": demo.state_holder,
                "App": demo._queue.server_app,
            }

            batch()
            before = census(owners)
            batch()
            after = census(owners)

        grew = {
            key: (before.get(key, 0), after.get(key, 0))
            for key in before.keys() | after.keys()
            if after.get(key, 0) > before.get(key, 0)
        }
        assert not grew, (
            "these grew over an identical batch of requests on the same session: "
            + ", ".join(f"{key} {b} -> {a}" for key, (b, a) in sorted(grew.items()))
        )

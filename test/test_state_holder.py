import datetime

import gradio as gr
from gradio.state_holder import StateHolder


def _holder(demo: gr.Blocks) -> StateHolder:
    holder = StateHolder()
    holder.set_blocks(demo)
    return holder


def _demo() -> gr.Blocks:
    with gr.Blocks() as demo:
        gr.State(0)
        gr.Textbox()
    return demo


class TestStateHolderDoesNotAccumulate:
    """See https://github.com/gradio-app/gradio/issues/11602."""

    def test_open_session_is_kept(self):
        holder = _holder(_demo())
        holder["abc"]

        holder.delete_all_expired_state()

        assert "abc" in holder.session_data
        assert "abc" in holder.time_last_used

    def test_closed_session_is_kept_during_its_grace_period(self):
        holder = _holder(_demo())
        holder["abc"].is_closed = True

        holder.delete_all_expired_state()

        assert "abc" in holder.session_data

    def test_closed_session_is_forgotten_once_it_expires(self):
        holder = _holder(_demo())
        session = holder["abc"]
        session.is_closed = True
        holder.time_last_used["abc"] = datetime.datetime.now() - datetime.timedelta(
            seconds=session.STATE_TTL_WHEN_CLOSED + 10
        )

        holder.delete_all_expired_state()

        assert "abc" not in holder.session_data
        assert "abc" not in holder.time_last_used

    def test_evicting_over_capacity_forgets_the_last_used_time(self):
        holder = _holder(_demo())
        holder.capacity = 2

        for i in range(5):
            holder[f"s{i}"]

        assert len(holder.session_data) == 2
        assert set(holder.time_last_used) == set(holder.session_data)

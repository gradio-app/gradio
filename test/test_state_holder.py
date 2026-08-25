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

    def test_expiring_state_keeps_the_session(self):
        holder = _holder(_demo())
        holder["abc"].is_closed = True

        holder.delete_all_expired_state()

        assert "abc" in holder.session_data
        assert "abc" in holder.time_last_used

    def test_evicting_over_capacity_forgets_the_last_used_time(self):
        holder = _holder(_demo())
        holder.capacity = 2

        for i in range(5):
            holder[f"s{i}"]

        assert len(holder.session_data) == 2
        assert set(holder.time_last_used) == set(holder.session_data)

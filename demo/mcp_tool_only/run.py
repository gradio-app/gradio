import gradio as gr

def slice_list(lst: list, start: int, end: int) -> list:
    """
    A tool that slices a list given a start and end index.
    Args:
        lst: The list to slice.
        start: The start index.
        end: The end index.
    Returns:
        The sliced list.
    """
    return lst[start:end]

with gr.Blocks() as demo:
    gr.Markdown(
        """
        This is a demo of a MCP-only tool.
        This tool slices a list.
        This tool is MCP-only, so it does not have a UI.
        """
    )
    gr.api(
        slice_list
    )

_, url, _ = demo.launch(mcp_server=True)
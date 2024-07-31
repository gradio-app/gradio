import gradio as gr
from data import df

with gr.Blocks() as demo:
    with gr.Row():
        origin = gr.Dropdown(["All", "DFW", "DAL", "HOU"], value="All", label="Origin")
        destination = gr.Dropdown(["All", "JFK", "LGA", "EWR"], value="All", label="Destination")
        max_price = gr.Slider(0, 1000, value=1000, label="Max Price")

    def filtered_data(origin, destination, max_price):
        _df = df[df["price"] <= max_price]
        if origin != "All":
            _df = _df[_df["origin"] == origin]
        if destination != "All":
            _df = _df[_df["destination"] == destination]
        return _df

    gr.ScatterPlot(filtered_data, x="time", y="price", inputs=[origin, destination, max_price])
    
if __name__ == "__main__":
    demo.launch()
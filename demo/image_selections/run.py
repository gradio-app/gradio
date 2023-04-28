import gradio as gr
import numpy as np

with gr.Blocks() as demo:
    tolerance = gr.Slider(label="Tolerance", info="How different colors can be in a segment.", minimum=0, maximum=256*3, value=50)
    with gr.Row():
        input_img = gr.Image(label="Input")
        output_img = gr.Image(label="Selected Segment")

    def get_select_coords(img, tolerance, evt: gr.SelectData):
        visited_pixels = set()
        pixels_in_queue = set()
        pixels_in_segment = set()
        start_pixel = img[evt.index[1], evt.index[0]]
        pixels_in_queue.add((evt.index[1], evt.index[0]))
        while len(pixels_in_queue) > 0:
            pixel = pixels_in_queue.pop()
            visited_pixels.add(pixel)
            neighbors = []
            if pixel[0] > 0:
                neighbors.append((pixel[0] - 1, pixel[1]))
            if pixel[0] < img.shape[0] - 1:
                neighbors.append((pixel[0] + 1, pixel[1]))
            if pixel[1] > 0:
                neighbors.append((pixel[0], pixel[1] - 1))
            if pixel[1] < img.shape[1] - 1:
                neighbors.append((pixel[0], pixel[1] + 1))
            for neighbor in neighbors:
                if neighbor in visited_pixels:
                    continue
                neighbor_pixel = img[neighbor[0], neighbor[1]]
                if np.abs(neighbor_pixel - start_pixel).sum() < tolerance:
                    pixels_in_queue.add(neighbor)
                    pixels_in_segment.add(neighbor)

        out = img.copy() * 0.2
        out = out.astype(np.uint8)
        for pixel in pixels_in_segment:
            out[pixel[0], pixel[1]] = img[pixel[0], pixel[1]]
        return out
    
    input_img.select(get_select_coords, [input_img, tolerance], output_img)

if __name__ == "__main__":
    demo.launch()

import cv2  # type: ignore
import gradio as gr

def gif_maker(img_files):
    img_array = []
    size = (1, 1)
    for filename in img_files:
        img = cv2.imread(filename.name)
        height, width, _ = img.shape
        size = (width,height)
        img_array.append(img)
    output_file = "test.mp4"
    out = cv2.VideoWriter(output_file,cv2.VideoWriter_fourcc(*'h264'), 15, size)  # type: ignore
    for i in range(len(img_array)):
        out.write(img_array[i])
    out.release()
    return output_file

demo = gr.Interface(gif_maker, inputs=gr.File(file_count="multiple"), outputs=gr.Video())

if __name__ == "__main__":
    demo.launch()

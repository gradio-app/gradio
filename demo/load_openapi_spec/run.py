import gradio as gr

demo = gr.load_openapi_spec(
    "https://petstore.swagger.io/v2/swagger.json",
    "https://petstore.swagger.io/v2"
)

if __name__ == "__main__":
    demo.launch()

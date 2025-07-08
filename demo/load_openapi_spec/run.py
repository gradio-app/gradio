import gradio as gr

demo = gr.load_openapi_spec(
    openapi_spec="https://petstore3.swagger.io/api/v3/openapi.json",
    base_url="https://petstore3.swagger.io/api/v3"
)

if __name__ == "__main__":
    demo.launch()

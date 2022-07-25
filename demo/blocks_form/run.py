import gradio as gr

with gr.Blocks() as demo:
    error_box = gr.Textbox(label="Error", visible=False)

    name_box = gr.Textbox(label="Name")
    age_box = gr.Number(label="Age")
    symptoms_box = gr.CheckboxGroup(["Cough", "Fever", "Runny Nose"])
    submit_btn = gr.Button("Submit")

    diagnosis_box = gr.Textbox(label="Diagnosis")
    patient_summary_box = gr.Textbox(label="Patient Summary", visible=False)

    def submit(name, age, symptoms):
        if len(name) == 0:
            return {error_box: gr.update(value="Enter name", visible=True)}
        if age < 0 or age > 200:
            return {error_box: gr.update(value="Enter valid age", visible=True)}
        return {
            diagnosis_box: "covid" if "Cough" in symptoms else "flu",
            patient_summary_box: gr.update(value=f"{name}, {age} y/o", visible=True)
        }

    submit_btn.click(
        submit,
        [name_box, age_box, symptoms_box],
        [error_box, diagnosis_box, patient_summary_box],
    )

if __name__ == "__main__":
    demo.launch()
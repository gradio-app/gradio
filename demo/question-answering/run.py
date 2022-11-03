import gradio as gr
context = "The Amazon rainforest, also known in English as Amazonia or the Amazon Jungle, is a moist broadleaf forest that covers most of the Amazon basin of South America. This basin encompasses 7,000,000 square kilometres (2,700,000 sq mi), of which 5,500,000 square kilometres (2,100,000 sq mi) are covered by the rainforest. This region includes territory belonging to nine nations. The majority of the forest is contained within Brazil, with 60% of the rainforest, followed by Peru with 13%, Colombia with 10%, and with minor amounts in Venezuela, Ecuador, Bolivia, Guyana, Suriname and French Guiana. The Amazon represents over half of the planet's remaining rainforests, and comprises the largest and most biodiverse tract of tropical rainforest in the world, with an estimated 390 billion individual trees divided into 16,000 species."
question = "Which continent is the Amazon rainforest in?"
gr.Interface.load(
             "huggingface/deepset/roberta-base-squad2",
             theme="default",
             inputs=[gr.inputs.Textbox(lines=7, default=context, label="Context Paragraph"), gr.inputs.Textbox(lines=2, default=question, label="Question")],
             outputs=[gr.outputs.Textbox(label="Answer"), gr.outputs.Textbox(label="Score")],
             title=None).launch()
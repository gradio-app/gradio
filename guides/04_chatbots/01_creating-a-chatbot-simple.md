# How to Create a Simple Chatbot with Gradio

Tags: NLP, TEXT, CHAT

## Introduction

Chatbots are a popular application of large language models. Because chatbots are designed to be used directly by customers and end users, it is important to validate that chatbots are behaving as expected when confronted with a wide variety of input prompts.

Using `gradio`, you can easily build a demo of your chatbot model and share that with your users, or try it yourself using an intuitive chatbot GUI.

This tutorial will highlight `gr.ChatbotInterface()` which is a high-level abstraction that allows you to create your chatbot UI with a single line of code. The chatbot interface that we create will look something like this:



We'll start with a toy example, and then show how to use `gr.ChatbotInterface()` with several popular APIs and libraries for creating chatbots, including `langchain`, `openai`, and Hugging Face. 

## A simple chatbot that echoes its inputs

## Other parameters in `gr.ChatbotInterface()`

## A `langchain` example

def predict(user_input, chatbot):

    chat = ChatOpenAI(temperature=1.0, streaming=True, model='gpt-3.5-turbo-0613')
    messages=[]

    for conv in chatbot:
        human = HumanMessage(content=conv[0])
        ai = AIMessage(content=conv[1])
        messages.append(human)
        messages.append(ai)

    messages.append(HumanMessage(content=user_input))

    # getting gpt3.5's response
    gpt_response = chat(messages)
    return gpt_response.content

gr.ChatInterface(predict, delete_last_btn="❌Delete").launch(debug=True) 

## An Streaming example using `openai` APIs 

openai.api_key = os.getenv("OPENAI_API_KEY")

def predict(inputs, chatbot):

    messages = []
    for conv in chatbot:
        user = conv[0]
        messages.append({"role": "user", "content":user })
        if conv[1] is None: 
            break
        assistant = conv[1]
        messages.append({"role": "assistant", "content":assistant})

    # a ChatCompletion request
    response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages= messages, # example :  [{'role': 'user', 'content': "What is life? Answer in three words."}],
        temperature=1.0,
        stream=True  # for streaming the output to chatbot
    )

    partial_message = ""
    for chunk in response:
        if len(chunk['choices'][0]['delta']) != 0:
          print(chunk['choices'][0]['delta']['content'])
          partial_message = partial_message + chunk['choices'][0]['delta']['content']
          yield partial_message 

gr.ChatInterface(predict, delete_last_btn="❌Delete").queue().launch(debug=True) 

## Examples using open-source LLMs with Hugging Face!

model2endpoint = {
    "starchat-alpha": "https://api-inference.huggingface.co/models/HuggingFaceH4/starcoderbase-finetuned-oasst1",
    "starchat-beta": "https://api-inference.huggingface.co/models/HuggingFaceH4/starchat-beta",
}
system_message = "Below is a conversation between a human user and a helpful AI coding assistant."

def predict(user_message, chatbot):
    client = Client(
            model2endpoint["starchat-beta"],
            headers={"Authorization": f"Bearer {<YOUR_INFERENCE_API_TOKEN>}"},
        )
    
    past_messages = []
    for data in chatbot:
        user_data, model_data = data
        if model_data is None:
            break
    
        past_messages.extend(
            [{"role": "user", "content": user_data}, {"role": "assistant", "content": model_data.rstrip()}]
        )
    
    if len(past_messages) < 1:
        dialogue_template = DialogueTemplate(
            system=system_message, messages=[{"role": "user", "content": user_message}]
        )
        prompt = dialogue_template.get_inference_prompt()
    else:
        dialogue_template = DialogueTemplate(
            system=system_message, messages=past_messages + [{"role": "user", "content": user_message}]
        )
        prompt = dialogue_template.get_inference_prompt()
    
    
    generate_kwargs = dict(
        temperature=1.0,
        max_new_tokens=1024,
        top_p=0.95,
        repetition_penalty=1.2,
        do_sample=True,
        truncate=4096,
        seed=42,
        stop_sequences=["<|end|>"],
    )
    
    stream = client.generate_stream(
        prompt,
        **generate_kwargs,
    )
    
    output = ""
    for idx, response in enumerate(stream):
        if response.token.special:
            continue
        output += response.token.text
        yield output #chat, history, user_message, ""

gr.ChatInterface(predict, delete_last_btn="❌Delete").queue().launch(debug=True)


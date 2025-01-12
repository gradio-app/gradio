import gradio as gr
from gradio import ChatMessage
import time

def simulate_thinking_chat(message: str, history: list):
    """Mimicking thinking process and response"""
    # Add initial empty thinking message to chat history

    history.append(  # Adds new message to the chat history list
        ChatMessage(  # Creates a new chat message
            role="assistant",  # Specifies this is from the assistant
            content="",  # Initially empty content
            metadata={"title": "Thinking... "}  # Setting a thinking header here
        )
    )
    time.sleep(0.5)
    yield history  # Returns current state of chat history
    
    # Define the thoughts that LLM will "think" through
    thoughts = [
        "First, I need to understand the core aspects of the query...",
        "Now, considering the broader context and implications...",
        "Analyzing potential approaches to formulate a comprehensive answer...",
        "Finally, structuring the response for clarity and completeness..."
    ]
    
    # Variable to store all thoughts as they accumulate
    accumulated_thoughts = ""
    
    # Loop through each thought
    for thought in thoughts:
        time.sleep(0.5)  # Add a samll delay for realism
        
        # Add new thought to accumulated thoughts with markdown bullet point
        accumulated_thoughts += f"- {thought}\n\n"  # \n\n creates line breaks
        
        # Update the thinking message with all thoughts so far
        history[-1] = ChatMessage(  # Updates last message in history
            role="assistant",
            content=accumulated_thoughts.strip(),  # Remove extra whitespace
            metadata={"title": "Thinking..."}  # Shows thinking header
        )
        yield history  # Returns updated chat history
    
    # After thinking is complete, adding the final response
    history.append(
        ChatMessage(
            role="assistant",
            content="Based on my thoughts and analysis above, my response is: This dummy repro shows how thoughts of a thinking LLM can be progressively shown before providing its final answer."
        )
    )
    yield history  # Returns final state of chat history

# Gradio blocks with gr.chatbot
with gr.Blocks() as demo:
    gr.Markdown("# Thinking LLM Demo 🤔")
    chatbot = gr.Chatbot(type="messages", render_markdown=True)
    msg = gr.Textbox(placeholder="Type your message...")
    
    msg.submit(
        lambda m, h: (m, h + [ChatMessage(role="user", content=m)]),
        [msg, chatbot],
        [msg, chatbot]
    ).then(
        simulate_thinking_chat,
        [msg, chatbot],
        chatbot
    )

if __name__ == "__main__":
    demo.launch()
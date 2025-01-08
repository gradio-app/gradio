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
    

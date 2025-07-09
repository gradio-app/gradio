# Gradio Playground Examples for Mockup Generator

PLAYGROUND_EXAMPLES = {
    "Text": {
        "Hello World": '''
# [textbox] "Name"
# [textbox] "Output"
# [button] "Greet"
''',
        "Hello Blocks": '''
# [textbox] "Name"
# [textbox] "Output Box"
# [button] "Greet"
''',
        "Sentence Builder": '''
# [slider] "Count" min=2 max=20
# [dropdown] "Animal" choices=["cat", "dog", "bird"]
# [checkboxgroup] "Countries" choices=["USA", "Canada", "UK", "France"]
# [radio] "Location" choices=["park", "zoo", "home"]
# [dropdown] "Activity" choices=["running", "sleeping", "playing"]
# [checkbox] "Morning"
# [textbox] "Output"
''',
        "Diff Texts": '''
# [textbox:3] "Text 1"
# [textbox:3] "Text 2"
# [highlightedtext] "Diff"
''',
        "Text Classification": '''
# [textbox:3] "Enter text to classify"
# [button] "Classify"
# [markdown] "Result will appear here"
''',
        "Sentiment Analysis": '''
# [textbox:3] "Enter text for sentiment analysis"
# [button] "Analyze"
# [markdown] "Sentiment: Result will appear here"
# [markdown] "Confidence: Score will appear here"
''',
        "Question Answering": '''
# [textbox:5] "Context"
# [textbox] "Question"
# [button] "Answer"
# [markdown] "Answer will appear here"
''',
        "Text Summarization": '''
# [textbox:8] "Enter text to summarize"
# [slider] "Max length" min=50 max=500
# [button] "Summarize"
# [textbox:4] "Summary will appear here"
''',
        "Language Translation": '''
# [dropdown] "Source Language" choices=["auto", "en", "es", "fr", "de"]
# [dropdown] "Target Language" choices=["en", "es", "fr", "de", "it"]
# [textbox:3] "Text to translate"
# [button] "Translate"
# [textbox:3] "Translation will appear here"
'''
    },
    "Media": {
        "Sepia Filter": '''
# [image] "Input Image"
# [image] "Output Image"
''',
        "Video Identity": '''
# [video] "Input Video"
# [video] "Output Video"
''',
        "Generate Tone": '''
# [dropdown] "Note" choices=["C", "D", "E", "F", "G", "A", "B"]
# [slider] "Octave" min=4 max=6
# [textbox] "Duration in seconds"
# [audio] "Generated Tone"
''',
        "Image Classification": '''
# [image] "Upload image"
# [button] "Classify"
# [markdown] "Classification results will appear here"
''',
        "Object Detection": '''
# [image] "Upload image"
# [button] "Detect Objects"
# [annotatedimage] "Detected objects will be highlighted here"
''',
        "Audio Transcription": '''
# [audio] "Upload or record audio"
# [button] "Transcribe"
# [textbox:3] "Transcription will appear here"
''',
        "Image Generation": '''
# [textbox] "Describe the image"
# [slider] "Steps" min=1 max=50
# [slider] "Guidance scale" min=1 max=20
# [button] "Generate"
# [image] "Generated image will appear here"
''',
        "Video Analysis": '''
# [video] "Upload video"
# [button] "Analyze"
# [markdown] "Analysis results will appear here"
# [dataframe] "Extracted data will appear here"
'''
    },
    "Tabular": {
        "Filter Records": '''
# [dataframe] "Records"
# [dropdown] "Gender" choices=["All", "Male", "Female"]
# [dataframe] "Filtered Records"
''',
        "Matrix Transpose": '''
# [dataframe] "Input Matrix"
# [dataframe] "Transposed Matrix"
''',
        "Tax Calculator": '''
# [number] "Income"
# [radio] "Marital Status" choices=["Single", "Married", "Divorced"]
# [dataframe] "Assets"
# [number] "Total Tax"
''',
        "Data Visualization": '''
# [file] "Upload CSV file"
# [dropdown] "Chart Type" choices=["line", "bar", "scatter", "histogram"]
# [dropdown] "X-axis" choices=["auto-populated"]
# [dropdown] "Y-axis" choices=["auto-populated"]
# [button] "Create Chart"
# [plot] "Chart will appear here"
''',
        "Statistical Analysis": '''
# [dataframe] "Input Data"
# [dropdown] "Analysis Type" choices=["mean", "median", "std", "correlation"]
# [button] "Analyze"
# [markdown] "Statistical results will appear here"
'''
    },
    "Chatbots": {
        "Chatbot": '''
# [chatbot] "Chat Interface"
# [textbox] "Type your message"
# [button] "Send"
''',
        "Streaming Chatbot": '''
# [chatbot] "Streaming Chat"
# [textbox] "Type your message"
# [button] "Send"
''',
        "Chatbot with Tools": '''
# [chatbot] "Chat with Tools"
# [textbox] "Type your message"
# [button] "Send"
# [button] "Get San Francisco Weather"
''',
        "Advanced Chatbot": '''
# [chatbot] "Conversation History"
# [row]
#   [textbox] "Type your message"
#   [button] "Send"
# [row]
#   [button] "Clear History"
#   [button] "Export Chat"
# [accordion] "Settings"
#   [slider] "Response Length" min=10 max=500
#   [checkbox] "Enable context memory"
#   [dropdown] "Model" choices=["GPT-3.5", "GPT-4", "Claude"]
''',
        "Multimodal Chatbot": '''
# [chatbot] "Multimodal Chat"
# [row]
#   [textbox] "Text message"
#   [file] "Upload image/file"
# [button] "Send"
'''
    },
    "Other": {
        "Tabbed Interface": '''
# [tabs]
#   [tab] "Hello World"
#     [textbox] "Name"
#     [textbox] "Output"
#   [tab] "Bye World"
#     [textbox] "Name"
#     [textbox] "Output"
''',
        "Layouts": '''
# [markdown] "Flip text or image files using this demo."
# [tabs]
#   [tab] "Flip Text"
#     [textbox] "Input"
#     [textbox] "Output"
#     [button] "Flip"
#   [tab] "Flip Image"
#     [row]
#       [image] "Input"
#       [image] "Output"
#     [button] "Flip"
# [accordion] "Open for More!"
#   [markdown] "Look at me..."
#   [slider] "Slide me" min=0 max=1
''',
        "Form Interface": '''
# [textbox] "Name"
# [textbox] "Email"
# [number] "Age"
# [checkbox] "Subscribe to newsletter"
# [radio] "Gender" choices=["Male", "Female", "Other"]
# [dropdown] "Country" choices=["USA", "Canada", "UK", "Germany"]
# [button] "Submit"
# [markdown] "Form submission result will appear here"
''',
        "Model Comparison": '''
# [textbox] "Input prompt"
# [row]
#   [column]
#     [markdown] "Model A"
#     [textbox:5] "Model A output"
#   [column]
#     [markdown] "Model B"
#     [textbox:5] "Model B output"
# [button] "Compare Models"
''',
        "File Processing": '''
# [file] "Upload file"
# [dropdown] "Processing Type" choices=["extract", "convert", "analyze"]
# [button] "Process"
# [file] "Download processed file"
# [markdown] "Processing status and results"
''',
        "Real-time Demo": '''
# [textbox] "Live input"
# [markdown] "Real-time results appear here automatically"
# [checkbox] "Enable live processing"
# [slider] "Processing speed" min=1 max=10
''',
        "Multi-step Wizard": '''
# [tabs]
#   [tab] "Step 1: Input"
#     [textbox] "Name"
#     [textbox] "Email"
#     [button] "Next"
#   [tab] "Step 2: Configuration"
#     [dropdown] "Theme" choices=["light", "dark", "auto"]
#     [checkboxgroup] "Features" choices=["notifications", "analytics", "backup"]
#     [button] "Next"
#   [tab] "Step 3: Review"
#     [markdown] "Review your settings"
#     [button] "Submit"
'''
    }
}


def get_example_names():
    """Get a list of all available example names."""
    examples = []
    for category, demos in PLAYGROUND_EXAMPLES.items():
        for demo_name in demos:
            examples.append(f"{category} → {demo_name}")
    return examples


def get_example(name):
    """Get a specific example by name."""
    if "→" not in name:
        return None
    category, demo_name = name.split(" → ", 1)
    if category in PLAYGROUND_EXAMPLES and demo_name in PLAYGROUND_EXAMPLES[category]:
        return {
            "name": demo_name,
            "category": category,
            "ascii": PLAYGROUND_EXAMPLES[category][demo_name].strip()
        }
    return None


def get_example_ascii(name):
    """Get just the ASCII art for a specific example."""
    example = get_example(name)
    return example["ascii"] if example else None


def get_categories():
    """Get a list of all categories."""
    return list(PLAYGROUND_EXAMPLES.keys())


def get_examples_by_category(category):
    """Get all examples for a specific category."""
    if category in PLAYGROUND_EXAMPLES:
        return list(PLAYGROUND_EXAMPLES[category])
    return []

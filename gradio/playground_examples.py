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
# [dropdown] "Animal"
# [checkboxgroup] "Countries"
# [radio] "Location"
# [dropdown] "Activity"
# [checkbox] "Morning"
# [textbox] "Output"
''',
        "Diff Texts": '''
# [textbox:3] "Text 1"
# [textbox:3] "Text 2"
# [highlightedtext] "Diff"
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
# [dropdown] "Note"
# [slider] "Octave" min=4 max=6
# [textbox] "Duration in seconds"
# [audio] "Generated Tone"
'''
    },
    "Tabular": {
        "Filter Records": '''
# [dataframe] "Records"
# [dropdown] "Gender"
# [dataframe] "Filtered Records"
''',
        "Matrix Transpose": '''
# [dataframe] "Input Matrix"
# [dataframe] "Transposed Matrix"
''',
        "Tax Calculator": '''
# [number] "Income"
# [radio] "Marital Status"
# [dataframe] "Assets"
# [number] "Total Tax"
'''
    },
    "Chatbots": {
        "Chatbot": '''
# [chatbot] "Chat Interface"
''',
        "Streaming Chatbot": '''
# [chatbot] "Streaming Chat"
''',
        "Chatbot with Tools": '''
# [chatbot] "Chat with Tools"
# [button] "Get San Francisco Weather"
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
'''
    }
}

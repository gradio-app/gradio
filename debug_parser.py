from gradio.mockup import MockupParser
from gradio.mockup_renderer import generate_mockup_html

ascii_art = '''
[textbox] "Title"
[row]
[textbox:3] "Description"
[column]
[slider] "Priority" min=1 max=5
[checkbox] "Urgent"
[button] "Create Task"
'''

parsed = MockupParser.parse(ascii_art)
print("Parsed result:")
import json
print(json.dumps(parsed, indent=2))

html = generate_mockup_html(parsed)
print("\nHTML contains Priority:", 'Priority' in html)
print("HTML contains Urgent:", 'Urgent' in html)
print("HTML contains Create Task:", 'Create Task' in html)

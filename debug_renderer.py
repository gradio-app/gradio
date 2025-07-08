import json
from gradio.mockup import MockupParser
from gradio.mockup_renderer import generate_mockup_html

# Test the exact same ASCII art from the failing test
ascii_art = """
[textbox] "Title"
[row]
[textbox:3] "Description"
[column]
[slider] "Priority" min=1 max=5
[checkbox] "Urgent"
[button] "Create Task"
"""

parsed = MockupParser.parse(ascii_art)
html = generate_mockup_html(parsed)

print("Priority in HTML:", 'Priority' in html)
print("Urgent in HTML:", 'Urgent' in html)
print("Create Task in HTML:", 'Create Task' in html)

# Let's look at the HTML around the Priority section
if 'Priority' in html:
    priority_idx = html.find('Priority')
    print("HTML around Priority:")
    print(html[priority_idx-100:priority_idx+200])
else:
    print("Priority not found. Let's look for slider:")
    if 'slider' in html:
        slider_idx = html.find('slider')
        print("HTML around slider:")
        print(html[slider_idx-100:slider_idx+200])
    else:
        print("No slider found either. Full HTML:")
        print(html)

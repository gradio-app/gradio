from gradio.cli.commands.mockup import mockup

# Test the mockup function
print("Testing mockup function...")
result = mockup('example_app.py')
print(f"Result: {result}")

# Check if the mockup file was created
import os
if os.path.exists('mockup_preview.html'):
    print("✓ mockup_preview.html was created")
    with open('mockup_preview.html', 'r') as f:
        content = f.read()
        print(f"HTML file size: {len(content)} characters")
        print("Priority in HTML:", 'Priority' in content)
        print("Bio in HTML:", 'Bio' in content)
else:
    print("✗ mockup_preview.html was not created")

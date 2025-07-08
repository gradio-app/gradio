#!/usr/bin/env python3

def test_mockup():
    print("Starting test...")
    
    try:
        from gradio.mockup import MockupParser
        print("✓ MockupParser imported")
    except Exception as e:
        print(f"✗ Error importing MockupParser: {e}")
        return
    
    try:
        from gradio.mockup_renderer import generate_mockup_html
        print("✓ generate_mockup_html imported")
    except Exception as e:
        print(f"✗ Error importing generate_mockup_html: {e}")
        return
    
    try:
        from gradio.cli.commands.mockup import mockup
        print("✓ mockup function imported")
    except Exception as e:
        print(f"✗ Error importing mockup function: {e}")
        return
    
    print("Testing mockup function...")
    try:
        result = mockup('example_app.py')
        print(f"Mockup function result: {result}")
    except Exception as e:
        print(f"Error running mockup: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_mockup()

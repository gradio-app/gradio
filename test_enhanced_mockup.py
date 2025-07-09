#!/usr/bin/env python3
"""
Test script to verify the enhanced mockup generator functionality.
"""

from gradio.mockup import MockupParser
from gradio.mockup_renderer import generate_mockup_html
from gradio.playground_examples import PLAYGROUND_EXAMPLES, get_example_names

def test_basic_functionality():
    """Test basic parsing and rendering"""
    print("Testing basic functionality...")
    
    # Test simple components
    ascii_art = """[textbox] "Name"
[dropdown] "Country" choices=["USA", "Canada", "UK"]
[button] "Submit"
"""
    
    try:
        parsed = MockupParser.parse(ascii_art)
        print(f"✓ Parsed successfully: {len(parsed['layout'])} components")
        
        html = generate_mockup_html(parsed)
        print(f"✓ Generated HTML: {len(html)} characters")
        
        # Check if choices are included
        if "USA" in html and "Canada" in html and "UK" in html:
            print("✓ Dropdown choices rendered correctly")
        else:
            print("✗ Dropdown choices not found in HTML")
            
    except Exception as e:
        print(f"✗ Error: {e}")

def test_playground_examples():
    """Test playground examples"""
    print("\nTesting playground examples...")
    
    try:
        example_names = get_example_names()
        print(f"✓ Found {len(example_names)} playground examples")
        
        # Test a few examples
        test_examples = ["Text → Hello World", "Media → Sepia Filter", "Chatbots → Chatbot"]
        
        for example_name in test_examples:
            if example_name in example_names:
                category, demo_name = example_name.split(" → ", 1)
                if category in PLAYGROUND_EXAMPLES and demo_name in PLAYGROUND_EXAMPLES[category]:
                    ascii_art = PLAYGROUND_EXAMPLES[category][demo_name].strip()
                    
                    # Clean the ASCII art
                    lines = []
                    for line in ascii_art.split('\n'):
                        line = line.strip()
                        if line.startswith('#'):
                            line = line[1:].strip()
                        if line:
                            lines.append(line)
                    
                    cleaned_ascii = '\n'.join(lines)
                    parsed = MockupParser.parse(cleaned_ascii)
                    html = generate_mockup_html(parsed)
                    
                    print(f"✓ {example_name}: {len(parsed['layout'])} components, {len(html)} chars HTML")
                else:
                    print(f"✗ {example_name}: not found in PLAYGROUND_EXAMPLES")
            else:
                print(f"✗ {example_name}: not in example names")
                
    except Exception as e:
        print(f"✗ Error testing playground examples: {e}")

def test_enhanced_components():
    """Test enhanced components with choices"""
    print("\nTesting enhanced components...")
    
    # Test dropdown with choices
    ascii_art = '[dropdown] "Language" choices=["Python", "JavaScript", "Java"]'
    try:
        parsed = MockupParser.parse(ascii_art)
        html = generate_mockup_html(parsed)
        
        if "Python" in html and "JavaScript" in html and "Java" in html:
            print("✓ Dropdown with choices works")
        else:
            print("✗ Dropdown choices not rendered")
            
    except Exception as e:
        print(f"✗ Error with dropdown: {e}")
    
    # Test radio with choices
    ascii_art = '[radio] "Gender" choices=["Male", "Female", "Other"]'
    try:
        parsed = MockupParser.parse(ascii_art)
        html = generate_mockup_html(parsed)
        
        if "Male" in html and "Female" in html and "Other" in html:
            print("✓ Radio with choices works")
        else:
            print("✗ Radio choices not rendered")
            
    except Exception as e:
        print(f"✗ Error with radio: {e}")

if __name__ == "__main__":
    test_basic_functionality()
    test_playground_examples()
    test_enhanced_components()
    print("\nTest completed!")

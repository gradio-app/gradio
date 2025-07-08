"""
Documentation for the Gradio Mockup Generator

This document provides comprehensive documentation for the Gradio mockup generator,
including usage examples, API reference, and best practices.
"""

# Gradio Mockup Generator Documentation

## Overview

The Gradio Mockup Generator is a development tool that allows developers to create
visual mockups of Gradio interfaces directly from ASCII art embedded in their source code.
This enables rapid prototyping and design iteration without needing to run the actual
Gradio application.

## Features

- **ASCII Art Parsing**: Convert simple ASCII art into structured component data
- **HTML Generation**: Generate styled HTML mockups that resemble Gradio interfaces
- **CLI Integration**: Command-line tool for easy integration into development workflows
- **Layout Support**: Support for row and column layouts with nested components
- **Component Types**: Support for textbox, slider, button, and checkbox components

## Installation

The mockup generator is included with Gradio and requires no additional installation.

## Usage

### 1. Command Line Interface

The easiest way to use the mockup generator is through the CLI:

```bash
gradio mockup your_app.py
```

This command will:
1. Read your source file
2. Extract ASCII art between special comment markers
3. Generate an HTML mockup file (`mockup_preview.html`)

### 2. ASCII Art Syntax

Embed ASCII art in your source files using special comment markers:

```python
# GRADIO MOCKUP START
[textbox] "Name"
[slider] "Age" min=0 max=100
[button] "Submit"
# GRADIO MOCKUP END
```

### 3. Supported Components

#### Textbox
- Single line: `[textbox] "Label"`
- Multi-line: `[textbox:N] "Label"` (where N is the number of lines)

#### Slider
- `[slider] "Label" min=X max=Y`

#### Button
- `[button] "Label"`

#### Checkbox
- `[checkbox] "Label"`

#### Layouts
- Row: `[row]` (components after this are arranged horizontally)
- Column: `[column]` (components after this are arranged vertically)

### 4. Layout Examples

#### Simple Layout
```
[textbox] "Name"
[textbox] "Email"
[button] "Submit"
```

#### Row Layout
```
[row]
[textbox] "First Name"
[textbox] "Last Name"
[button] "Submit"
```

#### Complex Layout
```
[textbox] "Title"
[row]
  [textbox:3] "Description"
  [column]
    [slider] "Priority" min=1 max=5
    [checkbox] "Urgent"
[button] "Create Task"
```

## API Reference

### MockupParser

The `MockupParser` class handles parsing ASCII art into structured data.

```python
from gradio.mockup import MockupParser

# Parse ASCII art
ascii_art = '[textbox] "Name"\\n[button] "Submit"'
result = MockupParser.parse(ascii_art)
```

#### Methods

- `parse(ascii_str: str) -> dict`: Parse ASCII art string into component data

### MockupRenderer

The `generate_mockup_html` function converts parsed data into HTML.

```python
from gradio.mockup_renderer import generate_mockup_html

# Generate HTML
html = generate_mockup_html(parsed_data)
```

#### Functions

- `generate_mockup_html(parsed_mockup: dict) -> str`: Generate complete HTML document
- `_render_component(comp: dict) -> str`: Render individual component (internal use)

## Best Practices

1. **Keep ASCII Art Simple**: Use clear, readable ASCII art that follows the syntax exactly
2. **Use Descriptive Labels**: Choose meaningful labels that reflect the actual component purpose
3. **Test Layouts**: Generate mockups frequently to verify your layout looks correct
4. **Version Control**: Include mockup markers in your version control to track design changes
5. **Documentation**: Use mockups to document your UI design decisions

## Error Handling

The mockup generator handles various error conditions gracefully:

- **Missing Markers**: If no ASCII art markers are found, a message is displayed
- **Invalid Syntax**: Invalid component syntax is ignored (components are skipped)
- **Missing Parameters**: Incomplete component definitions are ignored
- **File Errors**: File not found errors are propagated to the user

## Integration with Development Workflow

### 1. Design Phase
- Create ASCII art mockups before implementing actual components
- Use mockups to discuss design with team members
- Iterate on design without running the application

### 2. Development Phase
- Keep mockups updated as you implement features
- Use mockups to validate that implementation matches design
- Share mockups with stakeholders for feedback

### 3. Testing Phase
- Use mockups to create test cases
- Validate that actual interface matches mockup design
- Document expected behavior through mockups

## Troubleshooting

### Common Issues

1. **No mockup generated**: Ensure ASCII art is between the correct comment markers
2. **Components not rendering**: Check syntax for typos or missing quotes
3. **Layout not working**: Verify that container syntax is correct
4. **File not found**: Ensure the file path is correct and file exists

### Debug Tips

- Check that comment markers are exactly: `# GRADIO MOCKUP START` and `# GRADIO MOCKUP END`
- Verify component syntax matches the documented format
- Test with simple components first, then add complexity
- Use the generated HTML to debug styling issues

## Examples

See `example_mockup_usage.py` for a complete example showing both ASCII art
and the corresponding Gradio implementation.

## Contributing

When contributing to the mockup generator:

1. Add tests for new component types
2. Update documentation for new features
3. Ensure backward compatibility
4. Follow the existing code style and patterns

## License

The mockup generator is part of Gradio and uses the same license.

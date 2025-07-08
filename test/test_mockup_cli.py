"""Test CLI command functionality for the mockup generator."""

import os
import tempfile
import pytest
from unittest.mock import patch, mock_open
from gradio.cli.commands.mockup import mockup


class TestMockupCLI:
    """Test cases for the mockup CLI command."""

    def test_mockup_command_with_valid_file(self):
        """Test the mockup command with a valid file containing ASCII art."""
        file_content = '''
import gradio as gr

# GRADIO MOCKUP START
[textbox] "Name"
[button] "Submit"
# GRADIO MOCKUP END

def create_app():
    return gr.Interface(fn=lambda x: x, inputs="text", outputs="text")
'''
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(file_content)
            f.flush()
            
            with patch('builtins.open', mock_open(read_data=file_content)):
                with patch('builtins.print') as mock_print:
                    mockup(f.name)
                    mock_print.assert_called_with("Mockup generated: mockup_preview.html")
        
        os.unlink(f.name)

    def test_mockup_command_no_ascii_art(self):
        """Test the mockup command with a file containing no ASCII art."""
        file_content = '''
import gradio as gr

def create_app():
    return gr.Interface(fn=lambda x: x, inputs="text", outputs="text")
'''
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(file_content)
            f.flush()
            
            with patch('builtins.open', mock_open(read_data=file_content)):
                with patch('builtins.print') as mock_print:
                    mockup(f.name)
                    mock_print.assert_called_with("No valid mockup found in file")
        
        os.unlink(f.name)

    def test_mockup_command_complex_layout(self):
        """Test the mockup command with complex layout."""
        file_content = '''
# GRADIO MOCKUP START
[textbox] "Title"
[row]
[textbox:3] "Description"
[column]
[slider] "Priority" min=1 max=5
[checkbox] "Urgent"
[button] "Create Task"
# GRADIO MOCKUP END
'''
        
        with patch('builtins.open', mock_open(read_data=file_content)):
            with patch('builtins.print') as mock_print:
                mockup("test_file.py")
                mock_print.assert_called_with("Mockup generated: mockup_preview.html")

    def test_mockup_command_file_not_found(self):
        """Test the mockup command with a non-existent file."""
        with patch('builtins.open', side_effect=FileNotFoundError):
            with pytest.raises(FileNotFoundError):
                mockup("non_existent_file.py")

    def test_mockup_html_output_creation(self):
        """Test that the HTML output file is created correctly."""
        file_content = '''
# GRADIO MOCKUP START
[textbox] "Test"
# GRADIO MOCKUP END
'''
        
        mock_file = mock_open(read_data=file_content)
        with patch('builtins.open', mock_file):
            mockup("test_file.py")
            
            # Check that the output file was opened for writing
            mock_file.assert_any_call("mockup_preview.html", "w")
            
            # Get the written content
            handle = mock_file()
            written_content = ''.join(call.args[0] for call in handle.write.call_args_list)
            
            assert '<!DOCTYPE html>' in written_content
            assert 'Test' in written_content
            assert 'class="gradio-mockup"' in written_content

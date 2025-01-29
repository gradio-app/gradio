"""
This suite of tests is designed to ensure compatibility between the current version of Gradio
with custom components created using the previous version of Gradio.
"""

from pathlib import Path

from gradio_pdf import PDF


def test_processing_utils_backwards_compatibility():
    pdf_component = PDF()
    cached_pdf_file = pdf_component.as_example("test/test_files/sample_file.pdf")
    path = cached_pdf_file.path  # type: ignore
    assert (
        cached_pdf_file and Path(path).exists() and Path(path).name == "sample_file.pdf"
    )

from pathlib import Path
from unittest.mock import patch

import gradio
from gradio.cli import cli


@patch("gradio.reload.os.system")
@patch("gradio.cli.sys")
def test_run_in_reload_mode(mock_sys, mock_system_call):

    mock_sys.argv = ["gradio", "demo/calculator/run.py"]
    cli()
    reload_command = mock_system_call.call_args[0][0]
    gradio_dir = Path(gradio.__file__).parent
    demo_dir = Path("demo/calculator/run.py").resolve().parent

    assert "uvicorn demo.calculator.run:demo.app" in reload_command
    assert f'--reload-dir "{gradio_dir}"' in reload_command
    assert f'--reload-dir "{demo_dir}"' in reload_command

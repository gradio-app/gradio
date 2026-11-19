"""Core Gradio works without `gradio_components`, and everything that needs it says
how to install it."""

import importlib
import os
import subprocess
import sys
import textwrap

import numpy as np
import pytest

import gradio as gr
from gradio import _components_package
from gradio.queueing import _percentiles

# Runs in a fresh interpreter in which gradio_components and the libraries that only
# it requires cannot be imported, as in an environment made by `pip install gradio`.
CORE_ONLY = textwrap.dedent(
    """
    import importlib.abc, sys

    BLOCKED = {"gradio_components", "numpy", "pandas", "PIL"}

    class Blocker(importlib.abc.MetaPathFinder):
        def find_spec(self, name, path=None, target=None):
            if name.split(".")[0] in BLOCKED:
                raise ModuleNotFoundError(f"No module named {name!r}", name=name)

    sys.meta_path.insert(0, Blocker())
    """
)


def run_core_only(code: str) -> str:
    result = subprocess.run(
        [sys.executable, "-c", CORE_ONLY + textwrap.dedent(code)],
        check=False,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert result.returncode == 0, result.stderr
    return result.stdout


class TestWithoutComponents:
    def test_import_does_not_need_the_heavy_dependencies(self):
        out = run_core_only(
            """
            import gradio
            print(sorted(BLOCKED & {name.split(".")[0] for name in sys.modules}))
            """
        )
        assert out.strip() == "[]"

    def test_server_mode_serves_an_api(self):
        out = run_core_only(
            """
            import gradio as gr
            from gradio_client import Client

            app = gr.Server()

            @app.api(name="hello")
            def hello(name: str) -> str:
                return f"Hello {name}"

            _, url, _ = app.launch(prevent_thread_lock=True, executor="thread")
            print(Client(url, verbose=False).predict("core", api_name="/hello"))
            print(sorted(BLOCKED & {name.split(".")[0] for name in sys.modules}))
            sys.stdout.flush()
            import os
            os._exit(0)
            """
        )
        assert out.splitlines()[-2:] == ["Hello core", "[]"]

    def test_server_mode_serves_an_api_from_worker_processes(self, tmp_path):
        """The default executor starts a gateway and worker processes, which must
        not need `gradio_components` either. They inherit the blocker through a
        `sitecustomize` module on PYTHONPATH."""
        (tmp_path / "sitecustomize.py").write_text(CORE_ONLY)
        script = tmp_path / "app.py"
        script.write_text(
            textwrap.dedent(
                """
                import os
                import sys

                import gradio as gr
                from gradio_client import Client

                app = gr.Server()

                @app.api(name="hello")
                def hello(name: str) -> str:
                    return f"Hello {name}"

                if __name__ == "__main__":
                    _, url, _ = app.launch(prevent_thread_lock=True)
                    print(Client(url, verbose=False).predict("core", api_name="/hello"))
                    blocked = {"gradio_components", "numpy", "pandas", "PIL"}
                    print(sorted(blocked & {name.split(".")[0] for name in sys.modules}))
                    sys.stdout.flush()
                    os._exit(0)
                """
            )
        )
        env = dict(os.environ)
        env["PYTHONPATH"] = os.pathsep.join(
            filter(None, [str(tmp_path), env.get("PYTHONPATH")])
        )
        result = subprocess.run(
            [sys.executable, str(script)],
            check=False,
            capture_output=True,
            text=True,
            timeout=120,
            env=env,
        )
        assert result.returncode == 0, result.stderr
        assert result.stdout.splitlines()[-2:] == ["Hello core", "[]"]

    @pytest.mark.parametrize(
        "statement, feature",
        [
            ("gr.Textbox", "`gr.Textbox`"),
            ("gr.Blocks", "`gr.Blocks`"),
            ("gr.Interface", "`gr.Interface`"),
            ("gr.ChatInterface", "`gr.ChatInterface`"),
            ("gr.Row", "`gr.Row`"),
            ("gr.TextArea", "`gr.TextArea`"),
            ("gr.components.Image", "`gradio.components.Image`"),
            ("exec('from gradio import Image')", "`gr.Image`"),
            (
                "exec('from gradio.components.textbox import Textbox')",
                "`gradio.components.textbox`",
            ),
            ("exec('import gradio.templates')", "`gradio.templates`"),
            ("gr.component('textbox', render=False)", "the 'textbox' component"),
            ("exec('from gradio.blocks import Blocks; Blocks()')", "`gr.Blocks`"),
        ],
    )
    def test_using_a_component_says_how_to_install_them(self, statement, feature):
        out = run_core_only(
            f"""
            import gradio as gr
            try:
                {statement}
            except ImportError as error:
                print(type(error).__name__)
                print(error)
            """
        )
        assert out.splitlines()[0] == "ComponentsNotInstalledError"
        assert f"{feature} needs the `gradio_components` package" in out
        assert 'pip install "gradio[components]"' in out

    def test_core_names_are_available(self):
        out = run_core_only(
            """
            import gradio as gr
            print(gr.Server, gr.App, gr.Request, gr.Error, gr.api, gr.State, gr.Info)
            """
        )
        assert "gradio.server.Server" in out


class TestWithComponents:
    def test_every_public_name_resolves(self):
        for name in {*gr.__all__, *gr._NEEDS_COMPONENTS}:
            assert getattr(gr, name) is not None

    def test_old_module_paths_are_the_same_modules(self):
        for old, new in [
            ("gradio.components.textbox", "gradio_components.textbox"),
            ("gradio.templates", "gradio_components.templates"),
            ("gradio.image_utils", "gradio_components.image_utils"),
            ("gradio._simple_templates", "gradio_components._simple_templates"),
        ]:
            assert importlib.import_module(old) is importlib.import_module(new)
        from gradio.components import Textbox
        from gradio.components.textbox import (  # ty: ignore[unresolved-import]
            Textbox as FromModule,
        )

        assert Textbox is FromModule is gr.Textbox

    def test_core_component_modules_did_not_move(self):
        for module in _components_package.CORE_COMPONENT_MODULES:
            assert importlib.import_module(f"gradio.components.{module}").__name__ == (
                f"gradio.components.{module}"
            )

    def test_unknown_names_are_attribute_errors(self):
        with pytest.raises(AttributeError):
            gr.NotAComponent  # noqa: B018
        with pytest.raises(AttributeError):
            gr.components.NotAComponent  # noqa: B018

    def test_string_shortcuts(self):
        assert isinstance(gr.component("textbox", render=False), gr.Textbox)
        assert isinstance(gr.component("text", render=False), gr.Textbox)


@pytest.mark.parametrize("size", [1, 2, 3, 10, 101])
def test_percentiles_match_numpy(size):
    rng = np.random.default_rng(size)
    values = rng.uniform(0, 30, size).tolist()
    np.testing.assert_array_equal(
        _percentiles(values, [50, 90, 99]), np.percentile(values, [50, 90, 99])
    )


def test_percentiles_of_unfinished_events_are_nan():
    assert all(np.isnan(_percentiles([1.0, None], [50, 90])))
    assert all(np.isnan(_percentiles([], [50])))

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


def run_core_only(code: str, prelude: str = "") -> str:
    result = subprocess.run(
        [sys.executable, "-c", CORE_ONLY + prelude + "\n" + textwrap.dedent(code)],
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

    def test_built_in_routes_do_not_need_components(self):
        out = run_core_only(
            """
            import gradio as gr
            from gradio.profiling import RequestTrace, collector
            import httpx2 as httpx

            trace = RequestTrace(event_id="a", fn_name="hello")
            trace.total_ms = 10.0
            collector._traces.append(trace)
            summary = collector.get_summary()
            print(summary["phases"]["total"]["p50"], summary["phases"]["total"]["max"])

            app = gr.Server()
            favicon = os.path.abspath("test/test_files/bus.png")
            _, url, _ = app.launch(
                prevent_thread_lock=True, executor="thread", pwa=True,
                favicon_path=favicon,
            )
            print(httpx.get(url + "pwa_icon/192").status_code)
            monitoring = httpx.get(f"{url}monitoring/{app.analytics_key}")
            print(monitoring.status_code, "gradio[components]" in monitoring.text)
            print(sorted(BLOCKED & {name.split(".")[0] for name in sys.modules}))
            sys.stdout.flush()
            os._exit(0)
            """,
            prelude="import os",
        )
        lines = out.splitlines()
        assert "10.0 10.0" in lines
        assert lines[-3:] == ["200", "501 True", "[]"]

    @pytest.mark.parametrize(
        "statement, feature, error",
        [
            # attribute access is an AttributeError, as for any missing attribute
            ("gr.Textbox", "`gr.Textbox`", "ComponentsNotInstalledAttributeError"),
            # an import is an ImportError
            (
                "exec('from gradio import Blocks, Row')",
                "`gr.Blocks`",
                "ComponentsNotInstalledError",
            ),
            (
                "exec('from gradio.components.textbox import Textbox')",
                "`gradio.components.textbox`",
                "ComponentsNotInstalledError",
            ),
            (
                "exec('from gradio.blocks import Blocks; Blocks()')",
                "`gr.Blocks`",
                "ComponentsNotInstalledError",
            ),
        ],
    )
    def test_using_a_component_says_how_to_install_them(
        self, statement, feature, error
    ):
        out = run_core_only(
            f"""
            import gradio as gr
            try:
                {statement}
            except (ImportError, AttributeError) as error:
                print(type(error).__name__)
                print(error)
            """
        )
        assert out.splitlines()[0] == error
        assert f"{feature} needs the `gradio_components` package" in out
        assert 'pip install "gradio[components]"' in out

    def test_introspection_and_star_import_work_without_components(self):
        out = run_core_only(
            """
            import inspect
            import gradio as gr

            print(hasattr(gr, "Textbox"), getattr(gr, "Blocks", None))
            print(hasattr(gr.components, "Textbox"))
            print(len(inspect.getmembers(gr)) > 0)
            namespace = {}
            exec("from gradio import *", namespace)
            print("Server" in namespace, "close_all" in namespace, "Textbox" in namespace)
            """
        )
        assert out.splitlines() == ["False None", "False", "True", "True True False"]


class TestWithComponents:
    def test_old_module_paths_are_the_same_modules(self):
        for old, new in [
            ("gradio.components.textbox", "gradio_components.textbox"),
            ("gradio.templates", "gradio_components.templates"),
            ("gradio.image_utils", "gradio_components.image_utils"),
            ("gradio.interface", "gradio_components.interface"),
            ("gradio.layouts", "gradio_components.layouts"),
        ]:
            assert importlib.import_module(old) is importlib.import_module(new)
        from gradio.components import Textbox
        from gradio.components.textbox import (  # ty: ignore[unresolved-import]
            Textbox as FromModule,
        )

        assert Textbox is FromModule is gr.Textbox


@pytest.mark.parametrize("size", [1, 2, 101])
def test_percentiles_match_numpy(size):
    rng = np.random.default_rng(size)
    values = rng.uniform(0, 30, size).tolist()
    np.testing.assert_array_equal(
        _percentiles(values, [50, 90, 99]), np.percentile(values, [50, 90, 99])
    )


def run_python(code: str) -> str:
    result = subprocess.run(
        [sys.executable, "-W", "error::UserWarning", "-c", textwrap.dedent(code)],
        check=False,
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert result.returncode == 0, result.stderr
    return result.stdout


class TestImportOrder:
    def test_everything_is_registered_whichever_package_is_imported_first(self):
        def registered(first: str) -> list[str]:
            return run_python(
                f"""
                {first}
                import gradio as gr
                from gradio import utils

                print(sorted(c.__name__ for c in utils.core_gradio_components()))
                gr.Interface(lambda x: x, "textarea", "simpletextbox")
                print(gr.TextArea.__module__)
                """
            ).splitlines()

        gradio_first = registered("import gradio")
        components_first = registered("from gradio_components.textbox import Textbox")
        assert gradio_first == components_first
        assert "TextArea" in gradio_first[0] and "SimpleTextbox" in gradio_first[0]
        assert gradio_first[1] == "gradio_components.templates"

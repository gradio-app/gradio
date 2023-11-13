import ast
import sys
import tokenize
import types
from inspect import CO_COROUTINE

from gradio.wasm_utils import app_id_context

# BSD 3-Clause License
#
# - Copyright (c) 2008-Present, IPython Development Team
# - Copyright (c) 2001-2007, Fernando Perez <fernando.perez@colorado.edu>
# - Copyright (c) 2001, Janko Hauser <jhauser@zscout.de>
# - Copyright (c) 2001, Nathaniel Gray <n8gray@caltech.edu>
#
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice, this
#   list of conditions and the following disclaimer.

# * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.

# * Neither the name of the copyright holder nor the names of its
#   contributors may be used to endorse or promote products derived from
#   this software without specific prior written permission.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
# FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
# DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
# SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
# CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
# OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Code modified from IPython (BSD license)
# Source: https://github.com/ipython/ipython/blob/master/IPython/utils/syspathcontext.py#L42
class modified_sys_path:
    """A context for prepending a directory to sys.path for a second."""

    def __init__(self, script_path: str):
        self._script_path = script_path
        self._added_path = False

    def __enter__(self):
        if self._script_path not in sys.path:
            sys.path.insert(0, self._script_path)
            self._added_path = True

    def __exit__(self, type, value, traceback):
        if self._added_path:
            try:
                sys.path.remove(self._script_path)
            except ValueError:
                # It's already removed.
                pass

        # Returning False causes any exceptions to be re-raised.
        return False


# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022)
# Copyright (c) Yuichiro Tachibana (2023)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
def _new_module(name: str) -> types.ModuleType:
    """Create a new module with the given name."""
    return types.ModuleType(name)


async def _run_script(app_id: str, script_path: str) -> None:
    # This function is based on the following code from Streamlit:
    # https://github.com/streamlit/streamlit/blob/1.24.0/lib/streamlit/runtime/scriptrunner/script_runner.py#L519-L554
    # with modifications to support top-level await.

    with tokenize.open(script_path) as f:
        filebody = f.read()

    await _run_code(app_id, filebody, script_path)


async def _run_code(
        app_id: str,
        filebody: str,
        script_path: str = '<string>'  # This default value follows the convention. Ref: https://docs.python.org/3/library/functions.html#compile
    ) -> None:
    # NOTE: In Streamlit, the bytecode caching mechanism has been introduced.
    # However, we skipped it here for simplicity and because Gradio doesn't need to rerun the script so frequently,
    # while we may do it in the future.
    bytecode = compile(  # type: ignore
        filebody,
        # Pass in the file path so it can show up in exceptions.
        script_path,
        # We're compiling entire blocks of Python, so we need "exec"
        # mode (as opposed to "eval" or "single").
        mode="exec",
        # Don't inherit any flags or "future" statements.
        flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT, # Allow top-level await. Ref: https://github.com/whitphx/streamlit/commit/277dc580efb315a3e9296c9a0078c602a0904384
        dont_inherit=1,
        # Use the default optimization options.
        optimize=-1,
    )

    module = _new_module("__main__")

    # Install the fake module as the __main__ module. This allows
    # the pickle module to work inside the user's code, since it now
    # can know the module where the pickled objects stem from.
    # IMPORTANT: This means we can't use "if __name__ == '__main__'" in
    # our code, as it will point to the wrong module!!!
    sys.modules["__main__"] = module

    # Add special variables to the module's globals dict.
    module.__dict__["__file__"] = script_path

    with modified_sys_path(script_path), app_id_context(app_id):
        # Allow top-level await. Ref: https://github.com/whitphx/streamlit/commit/277dc580efb315a3e9296c9a0078c602a0904384
        if bytecode.co_flags & CO_COROUTINE:
            # The source code includes top-level awaits, so the compiled code object is a coroutine.
            await eval(bytecode, module.__dict__)
        else:
            exec(bytecode, module.__dict__)

(function(){"use strict";function O(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function p(e){if(typeof e!="string")throw new TypeError("Path must be a string. Received "+JSON.stringify(e))}function b(e,t){for(var o="",a=0,i=-1,s=0,n,r=0;r<=e.length;++r){if(r<e.length)n=e.charCodeAt(r);else{if(n===47)break;n=47}if(n===47){if(!(i===r-1||s===1))if(i!==r-1&&s===2){if(o.length<2||a!==2||o.charCodeAt(o.length-1)!==46||o.charCodeAt(o.length-2)!==46){if(o.length>2){var d=o.lastIndexOf("/");if(d!==o.length-1){d===-1?(o="",a=0):(o=o.slice(0,d),a=o.length-1-o.lastIndexOf("/")),i=r,s=0;continue}}else if(o.length===2||o.length===1){o="",a=0,i=r,s=0;continue}}t&&(o.length>0?o+="/..":o="..",a=2)}else o.length>0?o+="/"+e.slice(i+1,r):o=e.slice(i+1,r),a=r-i-1;i=r,s=0}else n===46&&s!==-1?++s:s=-1}return o}function E(e,t){var o=t.dir||t.root,a=t.base||(t.name||"")+(t.ext||"");return o?o===t.root?o+a:o+e+a:a}var _={resolve:function(){for(var e="",t=!1,o,a=arguments.length-1;a>=-1&&!t;a--){var i;a>=0?i=arguments[a]:(o===void 0&&(o=process.cwd()),i=o),p(i),i.length!==0&&(e=i+"/"+e,t=i.charCodeAt(0)===47)}return e=b(e,!t),t?e.length>0?"/"+e:"/":e.length>0?e:"."},normalize:function(e){if(p(e),e.length===0)return".";var t=e.charCodeAt(0)===47,o=e.charCodeAt(e.length-1)===47;return e=b(e,!t),e.length===0&&!t&&(e="."),e.length>0&&o&&(e+="/"),t?"/"+e:e},isAbsolute:function(e){return p(e),e.length>0&&e.charCodeAt(0)===47},join:function(){if(arguments.length===0)return".";for(var e,t=0;t<arguments.length;++t){var o=arguments[t];p(o),o.length>0&&(e===void 0?e=o:e+="/"+o)}return e===void 0?".":_.normalize(e)},relative:function(e,t){if(p(e),p(t),e===t||(e=_.resolve(e),t=_.resolve(t),e===t))return"";for(var o=1;o<e.length&&e.charCodeAt(o)===47;++o);for(var a=e.length,i=a-o,s=1;s<t.length&&t.charCodeAt(s)===47;++s);for(var n=t.length,r=n-s,d=i<r?i:r,h=-1,l=0;l<=d;++l){if(l===d){if(r>d){if(t.charCodeAt(s+l)===47)return t.slice(s+l+1);if(l===0)return t.slice(s+l)}else i>d&&(e.charCodeAt(o+l)===47?h=l:l===0&&(h=0));break}var f=e.charCodeAt(o+l),u=t.charCodeAt(s+l);if(f!==u)break;f===47&&(h=l)}var m="";for(l=o+h+1;l<=a;++l)(l===a||e.charCodeAt(l)===47)&&(m.length===0?m+="..":m+="/..");return m.length>0?m+t.slice(s+h):(s+=h,t.charCodeAt(s)===47&&++s,t.slice(s))},_makeLong:function(e){return e},dirname:function(e){if(p(e),e.length===0)return".";for(var t=e.charCodeAt(0),o=t===47,a=-1,i=!0,s=e.length-1;s>=1;--s)if(t=e.charCodeAt(s),t===47){if(!i){a=s;break}}else i=!1;return a===-1?o?"/":".":o&&a===1?"//":e.slice(0,a)},basename:function(e,t){if(t!==void 0&&typeof t!="string")throw new TypeError('"ext" argument must be a string');p(e);var o=0,a=-1,i=!0,s;if(t!==void 0&&t.length>0&&t.length<=e.length){if(t.length===e.length&&t===e)return"";var n=t.length-1,r=-1;for(s=e.length-1;s>=0;--s){var d=e.charCodeAt(s);if(d===47){if(!i){o=s+1;break}}else r===-1&&(i=!1,r=s+1),n>=0&&(d===t.charCodeAt(n)?--n===-1&&(a=s):(n=-1,a=r))}return o===a?a=r:a===-1&&(a=e.length),e.slice(o,a)}else{for(s=e.length-1;s>=0;--s)if(e.charCodeAt(s)===47){if(!i){o=s+1;break}}else a===-1&&(i=!1,a=s+1);return a===-1?"":e.slice(o,a)}},extname:function(e){p(e);for(var t=-1,o=0,a=-1,i=!0,s=0,n=e.length-1;n>=0;--n){var r=e.charCodeAt(n);if(r===47){if(!i){o=n+1;break}continue}a===-1&&(i=!1,a=n+1),r===46?t===-1?t=n:s!==1&&(s=1):t!==-1&&(s=-1)}return t===-1||a===-1||s===0||s===1&&t===a-1&&t===o+1?"":e.slice(t,a)},format:function(e){if(e===null||typeof e!="object")throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof e);return E("/",e)},parse:function(e){p(e);var t={root:"",dir:"",base:"",ext:"",name:""};if(e.length===0)return t;var o=e.charCodeAt(0),a=o===47,i;a?(t.root="/",i=1):i=0;for(var s=-1,n=0,r=-1,d=!0,h=e.length-1,l=0;h>=i;--h){if(o=e.charCodeAt(h),o===47){if(!d){n=h+1;break}continue}r===-1&&(d=!1,r=h+1),o===46?s===-1?s=h:l!==1&&(l=1):s!==-1&&(l=-1)}return s===-1||r===-1||l===0||l===1&&s===r-1&&s===n+1?r!==-1&&(n===0&&a?t.base=t.name=e.slice(1,r):t.base=t.name=e.slice(n,r)):(n===0&&a?(t.name=e.slice(1,s),t.base=e.slice(1,r)):(t.name=e.slice(n,s),t.base=e.slice(n,r)),t.ext=e.slice(s,r)),n>0?t.dir=e.slice(0,n-1):a&&(t.dir="/"),t},sep:"/",delimiter:":",win32:null,posix:null};_.posix=_;var N=_;const w=O(N);function A(e,t){const o=w.normalize(t),a=w.dirname(o).split("/"),i=[];for(const s of a){i.push(s);const n=i.join("/");if(e.FS.analyzePath(n).exists){if(e.FS.isDir(n))throw new Error(`"${n}" already exists and is not a directory.`);continue}try{e.FS.mkdir(n)}catch(r){throw console.error(`Failed to create a directory "${n}"`),r}}}function I(e,t,o,a){A(e,t),e.FS.writeFile(t,o,a)}function R(e,t,o){A(e,o),e.FS.rename(t,o)}function C(e){e.forEach(t=>{let o;try{o=new URL(t)}catch{return}if(o.protocol==="emfs:"||o.protocol==="file:")throw new Error(`"emfs:" and "file:" protocols are not allowed for the requirement (${t})`)})}function k(e){const t=[];for(const[o,a]of Object.entries(e))t.push([o,a]);return t}function T(e){let t="";for(let o=0;o<e.length;o++)t+=String.fromCharCode(e[o]);return t}function L(e){return e=e.map(([t,o])=>[T(t),T(o)]),Object.fromEntries(e)}const P=(e,t)=>new Promise((o,a)=>{let i=!1;async function s(){if(i)return{type:"http.disconnect"};const f={type:"http.request",more_body:!1};return t.body&&(f.body=t.body),console.debug("receive",f),i=!0,f}let n,r,d=new Uint8Array;async function h(f){const u=Object.fromEntries(f.toJs());if(console.debug("send",u),u.type==="http.response.start")n=u.status,r=L(u.headers);else if(u.type==="http.response.body"){if(d=new Uint8Array([...d,...u.body]),!u.more_body){const m={status:n,headers:r,body:d};console.debug("HTTP response",m),o(m)}}else throw new Error(`Unhandled ASGI event: ${JSON.stringify(u)}`)}const l={type:"http",asgi:{version:"3.0",spec_version:"2.1"},http_version:"1.1",scheme:"http",method:t.method,path:t.path,query_string:t.query_string,root_path:"",headers:k(t.headers)};e(l,s,h)}),D=`import tokenize
import types
import sys

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


def _run_script(script_path: str) -> None:
    # This function is based on the following code from Streamlit:
    # https://github.com/streamlit/streamlit/blob/1.24.0/lib/streamlit/runtime/scriptrunner/script_runner.py#L519-L554

    with tokenize.open(script_path) as f:
        filebody = f.read()

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
        flags=0,
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

    with modified_sys_path(script_path):
        exec(bytecode, module.__dict__)
`,x=`# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022)
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

import logging
import fnmatch
import os
import sys
import types
from typing import Optional, Set

LOGGER = logging.getLogger(__name__)

#
# Copied from https://github.com/streamlit/streamlit/blob/1.24.0/lib/streamlit/file_util.py
#

def file_is_in_folder_glob(filepath, folderpath_glob) -> bool:
    """Test whether a file is in some folder with globbing support.

    Parameters
    ----------
    filepath : str
        A file path.
    folderpath_glob: str
        A path to a folder that may include globbing.

    """
    # Make the glob always end with "/*" so we match files inside subfolders of
    # folderpath_glob.
    if not folderpath_glob.endswith("*"):
        if folderpath_glob.endswith("/"):
            folderpath_glob += "*"
        else:
            folderpath_glob += "/*"

    file_dir = os.path.dirname(filepath) + "/"
    return fnmatch.fnmatch(file_dir, folderpath_glob)


def get_directory_size(directory: str) -> int:
    """Return the size of a directory in bytes."""
    total_size = 0
    for dirpath, _, filenames in os.walk(directory):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            total_size += os.path.getsize(fp)
    return total_size


def file_in_pythonpath(filepath) -> bool:
    """Test whether a filepath is in the same folder of a path specified in the PYTHONPATH env variable.


    Parameters
    ----------
    filepath : str
        An absolute file path.

    Returns
    -------
    boolean
        True if contained in PYTHONPATH, False otherwise. False if PYTHONPATH is not defined or empty.

    """
    pythonpath = os.environ.get("PYTHONPATH", "")
    if len(pythonpath) == 0:
        return False

    absolute_paths = [os.path.abspath(path) for path in pythonpath.split(os.pathsep)]
    return any(
        file_is_in_folder_glob(os.path.normpath(filepath), path)
        for path in absolute_paths
    )

#
# Copied from https://github.com/streamlit/streamlit/blob/1.24.0/lib/streamlit/watcher/local_sources_watcher.py
#

def get_module_paths(module: types.ModuleType) -> Set[str]:
    paths_extractors = [
        # https://docs.python.org/3/reference/datamodel.html
        # __file__ is the pathname of the file from which the module was loaded
        # if it was loaded from a file.
        # The __file__ attribute may be missing for certain types of modules
        lambda m: [m.__file__],
        # https://docs.python.org/3/reference/import.html#__spec__
        # The __spec__ attribute is set to the module spec that was used
        # when importing the module. one exception is __main__,
        # where __spec__ is set to None in some cases.
        # https://www.python.org/dev/peps/pep-0451/#id16
        # "origin" in an import context means the system
        # (or resource within a system) from which a module originates
        # ... It is up to the loader to decide on how to interpret
        # and use a module's origin, if at all.
        lambda m: [m.__spec__.origin],
        # https://www.python.org/dev/peps/pep-0420/
        # Handling of "namespace packages" in which the __path__ attribute
        # is a _NamespacePath object with a _path attribute containing
        # the various paths of the package.
        lambda m: [p for p in m.__path__._path],
    ]

    all_paths = set()
    for extract_paths in paths_extractors:
        potential_paths = []
        try:
            potential_paths = extract_paths(module)
        except AttributeError:
            # Some modules might not have __file__ or __spec__ attributes.
            pass
        except Exception as e:
            LOGGER.warning(f"Examining the path of {module.__name__} raised: {e}")

        all_paths.update(
            [os.path.abspath(str(p)) for p in potential_paths if _is_valid_path(p)]
        )
    return all_paths


def _is_valid_path(path: Optional[str]) -> bool:
    return isinstance(path, str) and (os.path.isfile(path) or os.path.isdir(path))


#
# Original code
#

def unload_local_modules(target_dir_path: str = "."):
    """ Unload all modules that are in the target directory or in a subdirectory of it.
    It is necessary to unload modules before re-executing a script that imports the modules,
    so that the new version of the modules is loaded.
    The module unloading feature is extracted from Streamlit's LocalSourcesWatcher (https://github.com/streamlit/streamlit/blob/1.24.0/lib/streamlit/watcher/local_sources_watcher.py)
    and packaged as a standalone function.
    """
    target_dir_path = os.path.abspath(target_dir_path)
    loaded_modules = {} # filepath -> module_name

    # Copied from \`LocalSourcesWatcher.update_watched_modules()\`
    module_paths = {
        name: get_module_paths(module)
        for name, module in dict(sys.modules).items()
    }

    # Copied from \`LocalSourcesWatcher._register_necessary_watchers()\`
    for name, paths in module_paths.items():
        for path in paths:
            if file_is_in_folder_glob(path, target_dir_path) or file_in_pythonpath(path):
                loaded_modules[path] = name

    # Copied from \`LocalSourcesWatcher.on_file_changed()\`
    for module_name in loaded_modules.values():
        if module_name is not None and module_name in sys.modules:
            del sys.modules[module_name]
`;importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js");let c,g,S,v,y;async function F(e){console.debug("Loading Pyodide."),c=await loadPyodide({stdout:console.debug,stderr:console.error}),console.debug("Pyodide is loaded."),console.debug("Mounting files.",e.files),await Promise.all(Object.keys(e.files).map(async a=>{const i=e.files[a];let s;"url"in i?(console.debug(`Fetch a file from ${i.url}`),s=await fetch(i.url).then(r=>r.arrayBuffer()).then(r=>new Uint8Array(r))):s=i.data;const{opts:n}=e.files[a];console.debug(`Write a file "${a}"`),I(c,a,s,n)})),console.debug("Files are mounted."),console.debug("Loading micropip"),await c.loadPackage("micropip");const t=c.pyimport("micropip");console.debug("micropip is loaded.");const o=[e.gradioWheelUrl,e.gradioClientWheelUrl];console.debug("Loading Gradio wheels.",o),await t.add_mock_package("ffmpy","0.3.0"),await t.add_mock_package("orjson","3.8.12"),await t.add_mock_package("aiohttp","3.8.4"),await t.add_mock_package("multidict","4.7.6"),await c.loadPackage(["ssl","distutils","setuptools"]),await t.install(["markdown-it-py[linkify]~=2.2.0"]),await t.install.callKwargs(o,{keep_going:!0}),console.debug("Gradio wheels are loaded."),console.debug("Install packages.",e.requirements),await t.install.callKwargs(e.requirements,{keep_going:!0}),console.debug("Packages are installed."),console.debug("Mock os module methods."),await c.runPythonAsync(`
import os

os.link = lambda src, dst: None
`),console.debug("os module methods are mocked."),console.debug("Import gradio package."),await c.runPythonAsync("import gradio"),console.debug("gradio package is imported."),console.debug("Define a ASGI wrapper function."),await c.runPythonAsync(`
# Based on Shiny's App.call_pyodide().
# https://github.com/rstudio/py-shiny/blob/v0.3.3/shiny/_app.py#L224-L258
async def _call_asgi_app_from_js(scope, receive, send):
	# TODO: Pretty sure there are objects that need to be destroy()'d here?
	scope = scope.to_py()

	# ASGI requires some values to be byte strings, not character strings. Those are
	# not that easy to create in JavaScript, so we let the JS side pass us strings
	# and we convert them to bytes here.
	if "headers" in scope:
			# JS doesn't have \`bytes\` so we pass as strings and convert here
			scope["headers"] = [
					[value.encode("latin-1") for value in header]
					for header in scope["headers"]
			]
	if "query_string" in scope and scope["query_string"]:
			scope["query_string"] = scope["query_string"].encode("latin-1")
	if "raw_path" in scope and scope["raw_path"]:
			scope["raw_path"] = scope["raw_path"].encode("latin-1")

	async def rcv():
			event = await receive()
			return event.to_py()

	async def snd(event):
			await send(event)

	app = gradio.wasm_utils.get_registered_app()
	if app is None:
		raise RuntimeError("Gradio app has not been launched.")

	await app(scope, rcv, snd)
`),S=c.globals.get("_call_asgi_app_from_js"),console.debug("The ASGI wrapper function is defined."),console.debug("Mock async libraries."),await c.runPythonAsync(`
async def mocked_anyio_to_thread_run_sync(func, *args, cancellable=False, limiter=None):
	return func(*args)

import anyio.to_thread
anyio.to_thread.run_sync = mocked_anyio_to_thread_run_sync
	`),console.debug("Async libraries are mocked."),console.debug("Set matplotlib backend."),await c.runPythonAsync(`
import matplotlib
matplotlib.use("agg")
`),console.debug("matplotlib backend is set."),console.debug("Set up Python utility functions."),await c.runPythonAsync(D),v=c.globals.get("_run_script"),await c.runPythonAsync(x),y=c.globals.get("unload_local_modules"),console.debug("Python utility functions are set up.")}self.onmessage=async e=>{const t=e.data;console.debug("worker.onmessage",t);const o=e.ports[0];try{if(t.type==="init"){g=F(t.data);const a={type:"reply:success",data:null};o.postMessage(a);return}if(g==null)throw new Error("Pyodide Initialization is not started.");switch(await g,t.type){case"echo":{const a={type:"reply:success",data:t.data};o.postMessage(a);break}case"run-python-code":{y(),await c.runPythonAsync(t.data.code);const a={type:"reply:success",data:null};o.postMessage(a);break}case"run-python-file":{y(),v(t.data.path);const a={type:"reply:success",data:null};o.postMessage(a);break}case"http-request":{const a=t.data.request,i={type:"reply:success",data:{response:await P(S,a)}};o.postMessage(i);break}case"file:write":{const{path:a,data:i,opts:s}=t.data;console.debug(`Write a file "${a}"`),I(c,a,i,s);const n={type:"reply:success",data:null};o.postMessage(n);break}case"file:rename":{const{oldPath:a,newPath:i}=t.data;console.debug(`Rename "${a}" to ${i}`),R(c,a,i);const s={type:"reply:success",data:null};o.postMessage(s);break}case"file:unlink":{const{path:a}=t.data;console.debug(`Remove "${a}`),c.FS.unlink(a);const i={type:"reply:success",data:null};o.postMessage(i);break}case"install":{const{requirements:a}=t.data,i=c.pyimport("micropip");console.debug("Install the requirements:",a),C(a),await i.install.callKwargs(a,{keep_going:!0}).then(()=>{if(a.includes("matplotlib"))return c.runPythonAsync(`
                from stlite_server.bootstrap import _fix_matplotlib_crash
                _fix_matplotlib_crash()
              `)}).then(()=>{console.debug("Successfully installed");const s={type:"reply:success",data:null};o.postMessage(s)})}}}catch(a){const i={type:"reply:error",error:a};o.postMessage(i)}}})();
//# sourceMappingURL=webworker-ef888a22.js.map

(function(){"use strict";function T(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function p(e){if(typeof e!="string")throw new TypeError("Path must be a string. Received "+JSON.stringify(e))}function w(e,t){for(var s="",o=0,i=-1,a=0,r,n=0;n<=e.length;++n){if(n<e.length)r=e.charCodeAt(n);else{if(r===47)break;r=47}if(r===47){if(!(i===n-1||a===1))if(i!==n-1&&a===2){if(s.length<2||o!==2||s.charCodeAt(s.length-1)!==46||s.charCodeAt(s.length-2)!==46){if(s.length>2){var l=s.lastIndexOf("/");if(l!==s.length-1){l===-1?(s="",o=0):(s=s.slice(0,l),o=s.length-1-s.lastIndexOf("/")),i=n,a=0;continue}}else if(s.length===2||s.length===1){s="",o=0,i=n,a=0;continue}}t&&(s.length>0?s+="/..":s="..",o=2)}else s.length>0?s+="/"+e.slice(i+1,n):s=e.slice(i+1,n),o=n-i-1;i=n,a=0}else r===46&&a!==-1?++a:a=-1}return s}function O(e,t){var s=t.dir||t.root,o=t.base||(t.name||"")+(t.ext||"");return s?s===t.root?s+o:s+e+o:o}var _={resolve:function(){for(var e="",t=!1,s,o=arguments.length-1;o>=-1&&!t;o--){var i;o>=0?i=arguments[o]:(s===void 0&&(s=process.cwd()),i=s),p(i),i.length!==0&&(e=i+"/"+e,t=i.charCodeAt(0)===47)}return e=w(e,!t),t?e.length>0?"/"+e:"/":e.length>0?e:"."},normalize:function(e){if(p(e),e.length===0)return".";var t=e.charCodeAt(0)===47,s=e.charCodeAt(e.length-1)===47;return e=w(e,!t),e.length===0&&!t&&(e="."),e.length>0&&s&&(e+="/"),t?"/"+e:e},isAbsolute:function(e){return p(e),e.length>0&&e.charCodeAt(0)===47},join:function(){if(arguments.length===0)return".";for(var e,t=0;t<arguments.length;++t){var s=arguments[t];p(s),s.length>0&&(e===void 0?e=s:e+="/"+s)}return e===void 0?".":_.normalize(e)},relative:function(e,t){if(p(e),p(t),e===t||(e=_.resolve(e),t=_.resolve(t),e===t))return"";for(var s=1;s<e.length&&e.charCodeAt(s)===47;++s);for(var o=e.length,i=o-s,a=1;a<t.length&&t.charCodeAt(a)===47;++a);for(var r=t.length,n=r-a,l=i<n?i:n,h=-1,c=0;c<=l;++c){if(c===l){if(n>l){if(t.charCodeAt(a+c)===47)return t.slice(a+c+1);if(c===0)return t.slice(a+c)}else i>l&&(e.charCodeAt(s+c)===47?h=c:c===0&&(h=0));break}var f=e.charCodeAt(s+c),u=t.charCodeAt(a+c);if(f!==u)break;f===47&&(h=c)}var m="";for(c=s+h+1;c<=o;++c)(c===o||e.charCodeAt(c)===47)&&(m.length===0?m+="..":m+="/..");return m.length>0?m+t.slice(a+h):(a+=h,t.charCodeAt(a)===47&&++a,t.slice(a))},_makeLong:function(e){return e},dirname:function(e){if(p(e),e.length===0)return".";for(var t=e.charCodeAt(0),s=t===47,o=-1,i=!0,a=e.length-1;a>=1;--a)if(t=e.charCodeAt(a),t===47){if(!i){o=a;break}}else i=!1;return o===-1?s?"/":".":s&&o===1?"//":e.slice(0,o)},basename:function(e,t){if(t!==void 0&&typeof t!="string")throw new TypeError('"ext" argument must be a string');p(e);var s=0,o=-1,i=!0,a;if(t!==void 0&&t.length>0&&t.length<=e.length){if(t.length===e.length&&t===e)return"";var r=t.length-1,n=-1;for(a=e.length-1;a>=0;--a){var l=e.charCodeAt(a);if(l===47){if(!i){s=a+1;break}}else n===-1&&(i=!1,n=a+1),r>=0&&(l===t.charCodeAt(r)?--r===-1&&(o=a):(r=-1,o=n))}return s===o?o=n:o===-1&&(o=e.length),e.slice(s,o)}else{for(a=e.length-1;a>=0;--a)if(e.charCodeAt(a)===47){if(!i){s=a+1;break}}else o===-1&&(i=!1,o=a+1);return o===-1?"":e.slice(s,o)}},extname:function(e){p(e);for(var t=-1,s=0,o=-1,i=!0,a=0,r=e.length-1;r>=0;--r){var n=e.charCodeAt(r);if(n===47){if(!i){s=r+1;break}continue}o===-1&&(i=!1,o=r+1),n===46?t===-1?t=r:a!==1&&(a=1):t!==-1&&(a=-1)}return t===-1||o===-1||a===0||a===1&&t===o-1&&t===s+1?"":e.slice(t,o)},format:function(e){if(e===null||typeof e!="object")throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof e);return O("/",e)},parse:function(e){p(e);var t={root:"",dir:"",base:"",ext:"",name:""};if(e.length===0)return t;var s=e.charCodeAt(0),o=s===47,i;o?(t.root="/",i=1):i=0;for(var a=-1,r=0,n=-1,l=!0,h=e.length-1,c=0;h>=i;--h){if(s=e.charCodeAt(h),s===47){if(!l){r=h+1;break}continue}n===-1&&(l=!1,n=h+1),s===46?a===-1?a=h:c!==1&&(c=1):a!==-1&&(c=-1)}return a===-1||n===-1||c===0||c===1&&a===n-1&&a===r+1?n!==-1&&(r===0&&o?t.base=t.name=e.slice(1,n):t.base=t.name=e.slice(r,n)):(r===0&&o?(t.name=e.slice(1,a),t.base=e.slice(1,n)):(t.name=e.slice(r,a),t.base=e.slice(r,n)),t.ext=e.slice(a,n)),r>0?t.dir=e.slice(0,r-1):o&&(t.dir="/"),t},sep:"/",delimiter:":",win32:null,posix:null};_.posix=_;var k=_;const v=T(k);function S(e,t){const s=v.normalize(t),o=v.dirname(s).split("/"),i=[];for(const a of o){i.push(a);const r=i.join("/");if(e.FS.analyzePath(r).exists){if(e.FS.isDir(r))throw new Error(`"${r}" already exists and is not a directory.`);continue}try{e.FS.mkdir(r)}catch(n){throw console.error(`Failed to create a directory "${r}"`),n}}}function A(e,t,s,o){S(e,t),e.FS.writeFile(t,s,o)}function N(e,t,s){S(e,s),e.FS.rename(t,s)}function C(e){e.forEach(t=>{let s;try{s=new URL(t)}catch{return}if(s.protocol==="emfs:"||s.protocol==="file:")throw new Error(`"emfs:" and "file:" protocols are not allowed for the requirement (${t})`)})}function L(e){const t=[];for(const[s,o]of Object.entries(e))t.push([s,o]);return t}function E(e){let t="";for(let s=0;s<e.length;s++)t+=String.fromCharCode(e[s]);return t}function R(e){return e=e.map(([t,s])=>[E(t),E(s)]),Object.fromEntries(e)}const P=(e,t)=>new Promise((s,o)=>{let i=!1;async function a(){if(i)return{type:"http.disconnect"};const f={type:"http.request",more_body:!1};return t.body&&(f.body=t.body),console.debug("receive",f),i=!0,f}let r,n,l=new Uint8Array;async function h(f){const u=Object.fromEntries(f.toJs());if(console.debug("send",u),u.type==="http.response.start")r=u.status,n=R(u.headers);else if(u.type==="http.response.body"){if(l=new Uint8Array([...l,...u.body]),!u.more_body){const m={status:r,headers:n,body:l};console.debug("HTTP response",m),s(m)}}else throw new Error(`Unhandled ASGI event: ${JSON.stringify(u)}`)}const c={type:"http",asgi:{version:"3.0",spec_version:"2.1"},http_version:"1.1",scheme:"http",method:t.method,path:t.path,query_string:t.query_string,root_path:"",headers:L(t.headers)};e(c,a,h)});class x{constructor(){this._buffer=[],this._resolve=null,this._promise=null,this._notifyAll()}async _wait(){await this._promise}_notifyAll(){this._resolve&&this._resolve(),this._promise=new Promise(t=>this._resolve=t)}async dequeue(){for(;this._buffer.length===0;)await this._wait();return this._buffer.shift()}enqueue(t){this._buffer.push(t),this._notifyAll()}}class D extends EventTarget{constructor(t){super(),this.readyState=0,this.addEventListener("open",s=>{this.onopen&&this.onopen(s)}),this.addEventListener("message",s=>{this.onmessage&&this.onmessage(s)}),this.addEventListener("error",s=>{this.onerror&&this.onerror(s)}),this.addEventListener("close",s=>{this.onclose&&this.onclose(s)}),this._port=t,t.addEventListener("message",this._onMessage.bind(this)),t.start()}accept(){this.readyState===0&&(this.readyState=1,this._port.postMessage({type:"open"}))}send(t){if(this.readyState===0)throw new DOMException("Can't send messages while WebSocket is in CONNECTING state","InvalidStateError");this.readyState>1||this._port.postMessage({type:"message",value:{data:t}})}close(t,s){this.readyState>1||(this.readyState=2,this._port.postMessage({type:"close",value:{code:t,reason:s}}),this.readyState=3,this.dispatchEvent(new CloseEvent("close",{code:t,reason:s})))}_onMessage(t){const s=t.data;switch(console.debug("MessagePortWebSocket received event:",s),s.type){case"open":if(this.readyState===0){this.readyState=1,this.dispatchEvent(new Event("open"));return}break;case"message":if(this.readyState===1){this.dispatchEvent(new MessageEvent("message",{...s.value}));return}break;case"close":if(this.readyState<3){this.readyState=3,this.dispatchEvent(new CloseEvent("close",{...s.value}));return}break}this._reportError(`Unexpected event '${s.type}' while in readyState ${this.readyState}`,1002)}_reportError(t,s){this.dispatchEvent(new ErrorEvent("error",{message:t})),typeof s=="number"&&this.close(s,t)}}function M(e,t,s){const o=new x,i=new D(s);i.addEventListener("message",n=>{const l=n,h=typeof l.data=="string"?{type:"websocket.receive",text:l.data}:{type:"websocket.receive",bytes:l.data};o.enqueue(h)}),i.addEventListener("close",n=>{const l={type:"websocket.disconnect",code:n.code};o.enqueue(l)}),i.addEventListener("error",n=>{console.error(n)}),o.enqueue({type:"websocket.connect"});async function a(){return await o.dequeue()}async function r(n){const l=Object.fromEntries(n.toJs());switch(l.type){case"websocket.accept":{i.accept();break}case"websocket.send":{i.send(l.text??l.bytes);break}case"websocket.close":{i.close(l.code,l.reason);break}default:throw i.close(1002,"ASGI protocol error"),new Error(`Unhandled ASGI event: ${l.type}`)}}return e({type:"websocket",asgi:{version:"3.0",spec_version:"2.1"},path:t,headers:[],query_string:"",root_path:"http://xxx:99999",client:["",0]},a,r)}const F=`import tokenize
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
`,U=`# Copyright (c) Streamlit Inc. (2018-2022) Snowflake Inc. (2022)
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
`;importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js");let d,g,y,I,b;async function H(e){console.debug("Loading Pyodide."),d=await loadPyodide({stdout:console.debug,stderr:console.error}),console.debug("Pyodide is loaded."),console.debug("Mounting files.",e.files),await Promise.all(Object.keys(e.files).map(async o=>{const i=e.files[o];let a;"url"in i?(console.debug(`Fetch a file from ${i.url}`),a=await fetch(i.url).then(n=>n.arrayBuffer()).then(n=>new Uint8Array(n))):a=i.data;const{opts:r}=e.files[o];console.debug(`Write a file "${o}"`),A(d,o,a,r)})),console.debug("Files are mounted."),console.debug("Loading micropip"),await d.loadPackage("micropip");const t=d.pyimport("micropip");console.debug("micropip is loaded.");const s=[e.gradioWheelUrl,e.gradioClientWheelUrl];console.debug("Loading Gradio wheels.",s),await t.add_mock_package("ffmpy","0.3.0"),await t.add_mock_package("aiohttp","3.8.4"),await d.loadPackage(["ssl","distutils","setuptools"]),await t.install(["markdown-it-py[linkify]~=2.2.0"]),await t.install(["anyio==3.7.1"]),await t.install.callKwargs(s,{keep_going:!0}),console.debug("Gradio wheels are loaded."),console.debug("Install packages.",e.requirements),await t.install.callKwargs(e.requirements,{keep_going:!0}),console.debug("Packages are installed."),console.debug("Mock os module methods."),await d.runPythonAsync(`
import os

os.link = lambda src, dst: None
`),console.debug("os module methods are mocked."),console.debug("Import gradio package."),await d.runPythonAsync("import gradio"),console.debug("gradio package is imported."),console.debug("Define a ASGI wrapper function."),await d.runPythonAsync(`
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
`),y=d.globals.get("_call_asgi_app_from_js"),console.debug("The ASGI wrapper function is defined."),console.debug("Mock async libraries."),await d.runPythonAsync(`
async def mocked_anyio_to_thread_run_sync(func, *args, cancellable=False, limiter=None):
	return func(*args)

import anyio.to_thread
anyio.to_thread.run_sync = mocked_anyio_to_thread_run_sync
	`),console.debug("Async libraries are mocked."),console.debug("Set matplotlib backend."),await d.runPythonAsync(`
import matplotlib
matplotlib.use("agg")
`),console.debug("matplotlib backend is set."),console.debug("Set up Python utility functions."),await d.runPythonAsync(F),I=d.globals.get("_run_script"),await d.runPythonAsync(U),b=d.globals.get("unload_local_modules"),console.debug("Python utility functions are set up.")}self.onmessage=async e=>{const t=e.data;console.debug("worker.onmessage",t);const s=e.ports[0];try{if(t.type==="init"){g=H(t.data);const o={type:"reply:success",data:null};s.postMessage(o);return}if(g==null)throw new Error("Pyodide Initialization is not started.");switch(await g,t.type){case"echo":{const o={type:"reply:success",data:t.data};s.postMessage(o);break}case"run-python-code":{b(),await d.runPythonAsync(t.data.code);const o={type:"reply:success",data:null};s.postMessage(o);break}case"run-python-file":{b(),I(t.data.path);const o={type:"reply:success",data:null};s.postMessage(o);break}case"http-request":{const o=t.data.request,i={type:"reply:success",data:{response:await P(y,o)}};s.postMessage(i);break}case"websocket":{const{path:o}=t.data;console.debug("Initialize a WebSocket connection: ",{path:o}),M(y,o,s);break}case"file:write":{const{path:o,data:i,opts:a}=t.data;console.debug(`Write a file "${o}"`),A(d,o,i,a);const r={type:"reply:success",data:null};s.postMessage(r);break}case"file:rename":{const{oldPath:o,newPath:i}=t.data;console.debug(`Rename "${o}" to ${i}`),N(d,o,i);const a={type:"reply:success",data:null};s.postMessage(a);break}case"file:unlink":{const{path:o}=t.data;console.debug(`Remove "${o}`),d.FS.unlink(o);const i={type:"reply:success",data:null};s.postMessage(i);break}case"install":{const{requirements:o}=t.data,i=d.pyimport("micropip");console.debug("Install the requirements:",o),C(o),await i.install.callKwargs(o,{keep_going:!0}).then(()=>{if(o.includes("matplotlib"))return d.runPythonAsync(`
                from stlite_server.bootstrap import _fix_matplotlib_crash
                _fix_matplotlib_crash()
              `)}).then(()=>{console.debug("Successfully installed");const a={type:"reply:success",data:null};s.postMessage(a)})}}}catch(o){const i={type:"reply:error",error:o};s.postMessage(i)}}})();
//# sourceMappingURL=webworker-5e124733.js.map

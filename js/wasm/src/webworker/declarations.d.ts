import type { loadPyodide as loadPyodideValue } from "pyodide";

// Declarations for the WebWorker files where some variables are dynamically loaded through importScript.
declare let loadPyodide: typeof loadPyodideValue;

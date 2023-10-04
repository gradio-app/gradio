const __viteBrowserExternal_node_buffer = new Proxy({}, {
  get(_, key) {
    throw new Error(`Module "node:buffer" has been externalized for browser compatibility. Cannot access "node:buffer.${key}" in client code.  See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`)
  }
});

export { __viteBrowserExternal_node_buffer as default };
//# sourceMappingURL=__vite-browser-external_node_buffer-23035941.js.map

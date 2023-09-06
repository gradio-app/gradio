const r=new Proxy({},{get(o,e){throw new Error(`Module "node:buffer" has been externalized for browser compatibility. Cannot access "node:buffer.${e}" in client code.  See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`)}});export{r as default};
//# sourceMappingURL=__vite-browser-external_node_buffer-c9701883.js.map

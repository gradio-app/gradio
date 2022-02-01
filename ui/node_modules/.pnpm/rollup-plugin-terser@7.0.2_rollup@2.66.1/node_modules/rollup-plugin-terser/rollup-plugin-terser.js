const { codeFrameColumns } = require("@babel/code-frame");
const Worker = require("jest-worker").default;
const serialize = require("serialize-javascript");

function terser(userOptions = {}) {
  if (userOptions.sourceMap != null) {
    throw Error(
      "sourceMap option is removed. Now it is inferred from rollup options."
    );
  }
  if (userOptions.sourcemap != null) {
    throw Error(
      "sourcemap option is removed. Now it is inferred from rollup options."
    );
  }

  return {
    name: "terser",

    async renderChunk(code, chunk, outputOptions) {
      if (!this.worker) {
        this.worker = new Worker(require.resolve("./transform.js"), {
          numWorkers: userOptions.numWorkers,
        });
        this.numOfBundles = 0;
      }

      this.numOfBundles++;

      const defaultOptions = {
        sourceMap:
          outputOptions.sourcemap === true ||
          typeof outputOptions.sourcemap === "string",
      };
      if (outputOptions.format === "es" || outputOptions.format === "esm") {
        defaultOptions.module = true;
      }
      if (outputOptions.format === "cjs") {
        defaultOptions.toplevel = true;
      }

      const normalizedOptions = { ...defaultOptions, ...userOptions };

      // remove plugin specific options
      for (let key of ["numWorkers"]) {
        if (normalizedOptions.hasOwnProperty(key)) {
          delete normalizedOptions[key];
        }
      }

      const serializedOptions = serialize(normalizedOptions);

      try {
        const result = await this.worker.transform(code, serializedOptions);

        if (result.nameCache) {
          let { vars, props } = userOptions.nameCache;

          // only assign nameCache.vars if it was provided, and if terser produced values:
          if (vars) {
            const newVars =
              result.nameCache.vars && result.nameCache.vars.props;
            if (newVars) {
              vars.props = vars.props || {};
              Object.assign(vars.props, newVars);
            }
          }

          // support populating an empty nameCache object:
          if (!props) {
            props = userOptions.nameCache.props = {};
          }

          // merge updated props into original nameCache object:
          const newProps =
            result.nameCache.props && result.nameCache.props.props;
          if (newProps) {
            props.props = props.props || {};
            Object.assign(props.props, newProps);
          }
        }

        return result.result;
      } catch (error) {
        const { message, line, col: column } = error;
        console.error(
          codeFrameColumns(code, { start: { line, column } }, { message })
        );
        throw error;
      } finally {
        this.numOfBundles--;

        if (this.numOfBundles === 0) {
          this.worker.end();
          this.worker = 0;
        }
      }
    },
  };
}

exports.terser = terser;

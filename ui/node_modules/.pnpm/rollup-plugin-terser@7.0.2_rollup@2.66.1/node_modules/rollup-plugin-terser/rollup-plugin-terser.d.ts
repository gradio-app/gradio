import { Plugin } from "rollup";
import { MinifyOptions } from "terser";

export interface Options extends Omit<MinifyOptions, "sourceMap"> {
  /**
   * Amount of workers to spawn. Defaults to the number of CPUs minus 1.
   */
  numWorkers?: number;
}

export declare function terser(options?: Options): Plugin;

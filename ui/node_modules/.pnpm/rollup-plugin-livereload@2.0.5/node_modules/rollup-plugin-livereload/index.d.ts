import { Plugin } from 'rollup'

export interface RollupLivereloadOptions {
  /** Defaults to current directory */
  watch?: string | string[]

  /**
   * Inject the livereload snippet into the bundle which will enable livereload
   * in your web app.
   * Defaults to true 
   */
  inject?: boolean

  /**
   * Log a message to console when livereload is ready
   * Defaults to true 
   */
  verbose?: boolean

  ///
  /// Find all livereload options here:
  /// https://www.npmjs.com/package/livereload#user-content-server-api
  ///

  /**
   * The listening port.
   * It defaults to 35729 which is what the LiveReload extensions use currently.
   */
  port?: number

  /**
   * Add a delay (in milliseconds) between when livereload detects a change to
   * the filesystem and when it notifies the browser. Useful if the browser is
   * reloading/refreshing before a file has been compiled.
   */
  delay?: number

  /** Livereload options, improvements welcome */
  [livereloadOption: string]: any
}

/**
 * 🔄 A Rollup plugin for including livereload in your web app.
 */
export default function livereload(
  options?: RollupLivereloadOptions | string
): Plugin

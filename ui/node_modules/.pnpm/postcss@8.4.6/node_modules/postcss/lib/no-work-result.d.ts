import Result, { Message, ResultOptions } from './result.js'
import { SourceMap } from './postcss.js'
import Processor from './processor.js'
import Warning from './warning.js'
import Root from './root.js'
import LazyResult from './lazy-result.js'

/**
 * A Promise proxy for the result of PostCSS transformations.
 * This lazy result instance doesn't parse css unless `NoWorkResult#root` or `Result#root`
 * are accessed. See the example below for details.
 * A `NoWork` instance is returned by `Processor#process` ONLY when no plugins defined.
 *
 * ```js
 * const noWorkResult = postcss().process(css) // No plugins are defined.
 *                                             // CSS is not parsed
 * let root = noWorkResult.root // now css is parsed because we accessed the root
 * ```
 */
export default class NoWorkResult implements LazyResult {
  then: Promise<Result>['then']
  catch: Promise<Result>['catch']
  finally: Promise<Result>['finally']
  constructor(processor: Processor, css: string, opts: ResultOptions)
  get [Symbol.toStringTag](): string
  get processor(): Processor
  get opts(): ResultOptions
  get css(): string
  get content(): string
  get map(): SourceMap
  get root(): Root
  get messages(): Message[]
  warnings(): Warning[]
  toString(): string
  sync(): Result
  async(): Promise<Result>
}

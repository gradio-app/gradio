export default pluginCreator;
export type PostCssCalcOptions = {
    precision?: number | false;
    preserve?: boolean;
    warnWhenCannotResolve?: boolean;
    mediaQueries?: boolean;
    selectors?: boolean;
};
/**
 * @typedef {{precision?: number | false,
 *          preserve?: boolean,
 *          warnWhenCannotResolve?: boolean,
 *          mediaQueries?: boolean,
 *          selectors?: boolean}} PostCssCalcOptions
 */
/**
* @type {import('postcss').PluginCreator<PostCssCalcOptions>}
* @param {PostCssCalcOptions} opts
* @return {import('postcss').Plugin}
*/
declare function pluginCreator(opts: PostCssCalcOptions): import('postcss').Plugin;
declare namespace pluginCreator {
    const postcss: true;
}

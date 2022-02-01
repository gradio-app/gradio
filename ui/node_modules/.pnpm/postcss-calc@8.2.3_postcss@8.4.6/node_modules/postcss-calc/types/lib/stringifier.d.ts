/**
 * @param {string} calc
 * @param {import('../parser').CalcNode} node
 * @param {string} originalValue
 * @param {{precision: number | false, warnWhenCannotResolve: boolean}} options
 * @param {import("postcss").Result} result
 * @param {import("postcss").ChildNode} item
 *
 * @returns {string}
 */
export default function _default(calc: string, node: import('../parser').CalcNode, originalValue: string, options: {
    precision: number | false;
    warnWhenCannotResolve: boolean;
}, result: import("postcss").Result, item: import("postcss").ChildNode): string;

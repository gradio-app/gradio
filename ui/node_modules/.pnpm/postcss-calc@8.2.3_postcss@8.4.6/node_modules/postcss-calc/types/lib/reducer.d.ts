export default reduce;
export type Collectible = {
    preOperator: '+' | '-';
    node: import('../parser').CalcNode;
};
/**
 * @param {import('../parser').CalcNode} node
 * @param {number} precision
 * @return {import('../parser').CalcNode}
 */
declare function reduce(node: import('../parser').CalcNode, precision: number): import('../parser').CalcNode;

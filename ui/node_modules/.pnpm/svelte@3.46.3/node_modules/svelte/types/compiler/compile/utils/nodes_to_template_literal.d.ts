import { TemplateLiteral } from 'estree';
import { MustacheTag, Text } from '../../interfaces';
/**
 * Transforms a list of Text and MustacheTags into a TemplateLiteral expression.
 * Start/End positions on the elements of the expression are not set.
 */
export declare function nodes_to_template_literal(value: Array<Text | MustacheTag>): TemplateLiteral;

import { TemplateNode } from '../../interfaces';
import Component from '../Component';
import Expression from './shared/Expression';
import Node from './shared/Node';
import TemplateScope from './shared/TemplateScope';
export default class StyleDirective extends Node {
    type: 'StyleDirective';
    name: string;
    expression: Expression;
    should_cache: boolean;
    constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode);
}

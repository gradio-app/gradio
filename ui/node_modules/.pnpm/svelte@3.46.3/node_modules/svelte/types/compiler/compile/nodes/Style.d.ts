import Node from './shared/Node';
import Expression from './shared/Expression';
import { TemplateNode } from '../../interfaces';
import TemplateScope from './shared/TemplateScope';
import Component from '../Component';
export default class Style extends Node {
    type: 'Style';
    name: string;
    expression: Expression;
    should_cache: boolean;
    constructor(component: Component, parent: Node, scope: TemplateScope, info: TemplateNode);
}

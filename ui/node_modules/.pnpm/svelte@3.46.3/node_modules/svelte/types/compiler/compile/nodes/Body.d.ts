import Node from './shared/Node';
import EventHandler from './EventHandler';
import Action from './Action';
import Component from '../Component';
import TemplateScope from './shared/TemplateScope';
import { Element } from '../../interfaces';
export default class Body extends Node {
    type: 'Body';
    handlers: EventHandler[];
    actions: Action[];
    constructor(component: Component, parent: Node, scope: TemplateScope, info: Element);
}

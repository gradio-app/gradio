import { Node, Identifier } from 'estree';
import Component from '../../Component';
import TemplateScope from './TemplateScope';
export interface Context {
    key: Identifier;
    name?: string;
    modifier: (node: Node) => Node;
    default_modifier: (node: Node, to_ctx: (name: string) => Node) => Node;
}
export declare function unpack_destructuring({ contexts, node, modifier, default_modifier, scope, component }: {
    contexts: Context[];
    node: Node;
    modifier?: Context['modifier'];
    default_modifier?: Context['default_modifier'];
    scope: TemplateScope;
    component: Component;
}): void;

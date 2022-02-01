import Block from '../../Block';
import Action from '../../../nodes/Action';
import { Expression } from 'estree';
export default function add_actions(block: Block, target: string | Expression, actions: Action[]): void;
export declare function add_action(block: Block, target: string | Expression, action: Action): void;

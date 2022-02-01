import Let from '../../../nodes/Let';
import Block from '../../Block';
import TemplateScope from '../../../nodes/shared/TemplateScope';
import { BinaryExpression } from 'estree';
export declare function get_slot_definition(block: Block, scope: TemplateScope, lets: Let[]): {
    block: Block;
    scope: TemplateScope;
    get_context?: undefined;
    get_changes?: undefined;
} | {
    block: Block;
    scope: TemplateScope;
    get_context: (import("estree").Identifier & {
        start: number;
        end: number;
    }) | (import("estree").SimpleLiteral & {
        start: number;
        end: number;
    }) | (import("estree").RegExpLiteral & {
        start: number;
        end: number;
    }) | (import("estree").BigIntLiteral & {
        start: number;
        end: number;
    }) | (import("estree").FunctionExpression & {
        start: number;
        end: number;
    }) | (import("estree").ArrowFunctionExpression & {
        start: number;
        end: number;
    }) | (import("estree").ThisExpression & {
        start: number;
        end: number;
    }) | (import("estree").ArrayExpression & {
        start: number;
        end: number;
    }) | (import("estree").ObjectExpression & {
        start: number;
        end: number;
    }) | (import("estree").YieldExpression & {
        start: number;
        end: number;
    }) | (import("estree").UnaryExpression & {
        start: number;
        end: number;
    }) | (import("estree").UpdateExpression & {
        start: number;
        end: number;
    }) | (BinaryExpression & {
        start: number;
        end: number;
    }) | (import("estree").AssignmentExpression & {
        start: number;
        end: number;
    }) | (import("estree").LogicalExpression & {
        start: number;
        end: number;
    }) | (import("estree").MemberExpression & {
        start: number;
        end: number;
    }) | (import("estree").ConditionalExpression & {
        start: number;
        end: number;
    }) | (import("estree").SimpleCallExpression & {
        start: number;
        end: number;
    }) | (import("estree").NewExpression & {
        start: number;
        end: number;
    }) | (import("estree").SequenceExpression & {
        start: number;
        end: number;
    }) | (import("estree").TemplateLiteral & {
        start: number;
        end: number;
    }) | (import("estree").TaggedTemplateExpression & {
        start: number;
        end: number;
    }) | (import("estree").ClassExpression & {
        start: number;
        end: number;
    }) | (import("estree").MetaProperty & {
        start: number;
        end: number;
    }) | (import("estree").AwaitExpression & {
        start: number;
        end: number;
    }) | (import("estree").ImportExpression & {
        start: number;
        end: number;
    }) | (import("estree").ChainExpression & {
        start: number;
        end: number;
    });
    get_changes: (import("estree").Identifier & {
        start: number;
        end: number;
    }) | (import("estree").SimpleLiteral & {
        start: number;
        end: number;
    }) | (import("estree").RegExpLiteral & {
        start: number;
        end: number;
    }) | (import("estree").BigIntLiteral & {
        start: number;
        end: number;
    }) | (import("estree").FunctionExpression & {
        start: number;
        end: number;
    }) | (import("estree").ArrowFunctionExpression & {
        start: number;
        end: number;
    }) | (import("estree").ThisExpression & {
        start: number;
        end: number;
    }) | (import("estree").ArrayExpression & {
        start: number;
        end: number;
    }) | (import("estree").ObjectExpression & {
        start: number;
        end: number;
    }) | (import("estree").YieldExpression & {
        start: number;
        end: number;
    }) | (import("estree").UnaryExpression & {
        start: number;
        end: number;
    }) | (import("estree").UpdateExpression & {
        start: number;
        end: number;
    }) | (BinaryExpression & {
        start: number;
        end: number;
    }) | (import("estree").AssignmentExpression & {
        start: number;
        end: number;
    }) | (import("estree").LogicalExpression & {
        start: number;
        end: number;
    }) | (import("estree").MemberExpression & {
        start: number;
        end: number;
    }) | (import("estree").ConditionalExpression & {
        start: number;
        end: number;
    }) | (import("estree").SimpleCallExpression & {
        start: number;
        end: number;
    }) | (import("estree").NewExpression & {
        start: number;
        end: number;
    }) | (import("estree").SequenceExpression & {
        start: number;
        end: number;
    }) | (import("estree").TemplateLiteral & {
        start: number;
        end: number;
    }) | (import("estree").TaggedTemplateExpression & {
        start: number;
        end: number;
    }) | (import("estree").ClassExpression & {
        start: number;
        end: number;
    }) | (import("estree").MetaProperty & {
        start: number;
        end: number;
    }) | (import("estree").AwaitExpression & {
        start: number;
        end: number;
    }) | (import("estree").ImportExpression & {
        start: number;
        end: number;
    }) | (import("estree").ChainExpression & {
        start: number;
        end: number;
    });
};

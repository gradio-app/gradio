import Stats from '../Stats';
import { Scope } from './utils/scope';
import Stylesheet from './css/Stylesheet';
import Fragment from './nodes/Fragment';
import { Ast, CompileOptions, Var, Warning, CssResult } from '../interfaces';
import TemplateScope from './nodes/shared/TemplateScope';
import Slot from './nodes/Slot';
import { Node, ImportDeclaration, ExportNamedDeclaration, Identifier, FunctionDeclaration } from 'estree';
import Element from './nodes/Element';
interface ComponentOptions {
    namespace?: string;
    tag?: string;
    immutable?: boolean;
    accessors?: boolean;
    preserveWhitespace?: boolean;
}
export default class Component {
    stats: Stats;
    warnings: Warning[];
    ignores: Set<string>;
    ignore_stack: Array<Set<string>>;
    ast: Ast;
    original_ast: Ast;
    source: string;
    name: Identifier;
    compile_options: CompileOptions;
    fragment: Fragment;
    module_scope: Scope;
    instance_scope: Scope;
    instance_scope_map: WeakMap<Node, Scope>;
    component_options: ComponentOptions;
    namespace: string;
    tag: string;
    accessors: boolean;
    vars: Var[];
    var_lookup: Map<string, Var>;
    imports: ImportDeclaration[];
    exports_from: ExportNamedDeclaration[];
    instance_exports_from: ExportNamedDeclaration[];
    hoistable_nodes: Set<Node>;
    node_for_declaration: Map<string, Node>;
    partly_hoisted: Array<(Node | Node[])>;
    fully_hoisted: Array<(Node | Node[])>;
    reactive_declarations: Array<{
        assignees: Set<string>;
        dependencies: Set<string>;
        node: Node;
        declaration: Node;
    }>;
    reactive_declaration_nodes: Set<Node>;
    has_reactive_assignments: boolean;
    injected_reactive_declaration_vars: Set<string>;
    helpers: Map<string, Identifier>;
    globals: Map<string, Identifier>;
    indirect_dependencies: Map<string, Set<string>>;
    file: string;
    locate: (c: number) => {
        line: number;
        column: number;
    };
    elements: Element[];
    stylesheet: Stylesheet;
    aliases: Map<string, Identifier>;
    used_names: Set<string>;
    globally_used_names: Set<string>;
    slots: Map<string, Slot>;
    slot_outlets: Set<string>;
    constructor(ast: Ast, source: string, name: string, compile_options: CompileOptions, stats: Stats, warnings: Warning[]);
    add_var(node: Node, variable: Var, add_to_lookup?: boolean): void;
    add_reference(node: Node, name: string): void;
    alias(name: string): Identifier;
    apply_stylesheet(element: Element): void;
    global(name: string): Identifier;
    generate(result?: {
        js: Node[];
        css: CssResult;
    }): {
        js: any;
        css: any;
        ast: Ast;
        warnings: Warning[];
        vars: Var[];
        stats: {
            timings: {
                total: number;
            };
        };
    };
    get_unique_name(name: string, scope?: Scope): Identifier;
    get_unique_name_maker(): (name: string) => Identifier;
    get_vars_report(): Var[];
    error(pos: {
        start: number;
        end: number;
    }, e: {
        code: string;
        message: string;
    }): void;
    warn(pos: {
        start: number;
        end: number;
    }, warning: {
        code: string;
        message: string;
    }): void;
    extract_imports(node: any): void;
    extract_exports(node: any, module_script?: boolean): void | FunctionDeclaration | import("estree").VariableDeclaration | import("estree").ClassDeclaration;
    private _extract_exports;
    extract_javascript(script: any): any;
    walk_module_js(): void;
    walk_instance_js_pre_template(): void;
    walk_instance_js_post_template(): void;
    post_template_walk(): void;
    track_references_and_mutations(): void;
    warn_on_undefined_store_value_references(node: Node, parent: Node, prop: string, scope: Scope): void;
    loop_protect(node: any, scope: Scope, timeout: number): Node | null;
    rewrite_props(get_insert: (variable: Var) => Node[]): void;
    hoist_instance_declarations(): void;
    extract_reactive_declarations(): void;
    warn_if_undefined(name: string, node: any, template_scope: TemplateScope): void;
    push_ignores(ignores: any): void;
    pop_ignores(): void;
}
export {};

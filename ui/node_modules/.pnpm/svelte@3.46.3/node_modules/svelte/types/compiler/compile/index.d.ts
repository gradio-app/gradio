import { CompileOptions, Warning } from '../interfaces';
export default function compile(source: string, options?: CompileOptions): {
    js: any;
    css: any;
    ast: import("../interfaces").Ast;
    warnings: Warning[];
    vars: import("../interfaces").Var[];
    stats: {
        timings: {
            total: number;
        };
    };
};

from __future__ import annotations

import ast
import inspect
import textwrap
from collections.abc import Callable
from functools import wraps


def js(fn: Callable) -> Callable:
    """
    A decorator that marks a function to be transpiled to JavaScript and run on the client side.

    Parameters:
        fn: The Python function to be transpiled to JavaScript
    Returns:
        The original function wrapped with JavaScript transpilation metadata
    """
    fn.__js_implementation__ = None

    @wraps(fn)
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)

    return wrapper


class TranspilerError(Exception):
    """Exception raised when transpilation fails or encounters ambiguous syntax."""

    def __init__(self, message: str, node: ast.AST | None = None):
        self.node = node
        if node and hasattr(node, "lineno"):
            message = f"Line {node.lineno}: {message}"  # type: ignore
        super().__init__(message)


class PythonToJSVisitor(ast.NodeVisitor):
    def __init__(self):
        self.js_lines = []  # Accumulate lines of JavaScript code.
        self.indent_level = 0  # Track current indent level for readability.

    def indent(self) -> str:
        return "    " * self.indent_level

    # === Function Definition ===
    def visit_FunctionDef(self, node: ast.FunctionDef):  # noqa: N802
        # Extract parameter names. (Later we could add type hint checks.)
        params = [arg.arg for arg in node.args.args]
        header = f"function {node.name}({', '.join(params)}) " + "{"
        self.js_lines.append(header)
        self.indent_level += 1

        # Process the function body.
        for stmt in node.body:
            self.visit(stmt)
        self.indent_level -= 1
        self.js_lines.append("}")

    # === Return Statement ===
    def visit_Return(self, node: ast.Return):  # noqa: N802
        ret_val = "" if node.value is None else self.visit(node.value)
        self.js_lines.append(f"{self.indent()}return {ret_val};")

    # === Expression Statements ===
    def visit_Expr(self, node: ast.Expr):  # noqa: N802
        # For standalone expressions, output them followed by a semicolon.
        expr = self.visit(node.value)
        self.js_lines.append(f"{self.indent()}{expr};")

    # === Assignment ===
    def visit_Assign(self, node: ast.Assign):  # noqa: N802
        if len(node.targets) != 1:
            raise TranspilerError("Multiple assignment targets are not supported yet.")
        target = self.visit(node.targets[0])
        value = self.visit(node.value)
        # Always declare variables with 'let' for now.
        self.js_lines.append(f"{self.indent()}let {target} = {value};")

    # === Binary Operations ===
    def visit_BinOp(self, node: ast.BinOp):  # noqa: N802
        left = self.visit(node.left)
        right = self.visit(node.right)
        op = self.visit(node.op)
        return f"({left} {op} {right})"

    def visit_Add(self, node: ast.Add):  # noqa: N802
        return "+"

    def visit_Sub(self, node: ast.Sub):  # noqa: N802
        return "-"

    def visit_Mult(self, node: ast.Mult):  # noqa: N802
        return "*"

    def visit_Div(self, node: ast.Div):  # noqa: N802
        return "/"

    # === Comparison Operations ===
    def visit_Compare(self, node: ast.Compare):  # noqa: N802
        left = self.visit(node.left)
        ops = [self.visit(op) for op in node.ops]
        comparators = [self.visit(comp) for comp in node.comparators]

        # For now, we only support single comparisons
        if len(ops) != 1 or len(comparators) != 1:
            raise TranspilerError("Only single comparisons are supported")

        return f"({left} {ops[0]} {comparators[0]})"

    def visit_Gt(self, node: ast.Gt):  # noqa: N802
        return ">"

    def visit_Lt(self, node: ast.Lt):  # noqa: N802
        return "<"

    def visit_GtE(self, node: ast.GtE):  # noqa: N802
        return ">="

    def visit_LtE(self, node: ast.LtE):  # noqa: N802
        return "<="

    def visit_Eq(self, node: ast.Eq):  # noqa: N802
        return "==="

    def visit_NotEq(self, node: ast.NotEq):  # noqa: N802
        return "!=="

    # === If Statement ===
    def visit_If(self, node: ast.If):  # noqa: N802
        test = self.visit(node.test)
        self.js_lines.append(f"{self.indent()}if ({test}) " + "{")
        self.indent_level += 1
        for stmt in node.body:
            self.visit(stmt)
        self.indent_level -= 1
        self.js_lines.append(f"{self.indent()}" + "}")

        if node.orelse:
            self.js_lines.append(f"{self.indent()}else " + "{")
            self.indent_level += 1
            for stmt in node.orelse:
                self.visit(stmt)
            self.indent_level -= 1
            self.js_lines.append(f"{self.indent()}" + "}")

    # === Function Calls ===
    def visit_Call(self, node: ast.Call):  # noqa: N802
        func = self.visit(node.func)
        args = [self.visit(arg) for arg in node.args]
        return f"{func}({', '.join(args)})"

    # === Variable Name ===
    def visit_Name(self, node: ast.Name):  # noqa: N802
        return node.id

    # === Constants ===
    def visit_Constant(self, node: ast.Constant):  # noqa: N802
        # Use repr() to generate a JS-friendly literal.
        return repr(node.value)

    # === Fallback for Unsupported Nodes ===
    def generic_visit(self, node):
        raise TranspilerError(
            f"Unsupported or ambiguous syntax encountered: {ast.dump(node)}", node
        )


def transpile(fn: Callable) -> str:
    """
    Transpiles a Python function to JavaScript and returns the JavaScript code as a string.
    """
    # Retrieve the source code of the function.
    try:
        source = inspect.getsource(fn)
        source = textwrap.dedent(source)
    except Exception as e:
        raise TranspilerError(
            "Could not retrieve source code from the function."
        ) from e

    # Parse the source code into an AST.
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        raise TranspilerError("Could not parse function source.") from e

    # Find the first function definition in the AST.
    func_node = None
    for node in tree.body:
        if isinstance(node, ast.FunctionDef):
            func_node = node
            break

    if func_node is None:
        raise TranspilerError("No function definition found in the provided source.")

    # Visit the function node to generate JavaScript code.
    visitor = PythonToJSVisitor()
    visitor.visit(func_node)
    return "\n".join(visitor.js_lines)


# === Example Usage ===
def example_function(x, y):
    z = x + y
    if z > 10:
        return z
    else:
        return 0


if __name__ == "__main__":
    try:
        js_code = transpile(example_function)
        print("Generated JavaScript Code:")
        print(js_code)
    except TranspilerError as err:
        print("Transpilation failed:", err)

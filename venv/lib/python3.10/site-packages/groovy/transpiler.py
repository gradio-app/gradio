from __future__ import annotations

import ast
import builtins
import inspect
import json
import textwrap
from collections.abc import Callable


class TranspilerError(Exception):
    """Exception raised when transpilation fails or encounters ambiguous syntax."""

    def __init__(
        self,
        issues: list[tuple[int, str, str]] | None = None,
        message: str | None = None,
    ):
        self.issues = issues or []
        if message:
            super().__init__(message)
        else:
            issue_count = len(self.issues)
            issues_text = (
                f"{issue_count} issue{'s' if issue_count != 1 else ''} found:\n\n"
            )
            for line_no, message, code in self.issues:
                issues_text += f"* Line {line_no}: {message}\n>> {code}\n"
            super().__init__(issues_text)


class PythonToJSVisitor(ast.NodeVisitor):
    def __init__(self):
        self.js_lines = []  # Accumulate lines of JavaScript code.
        self.indent_level = 0  # Track current indent level for readability.
        self.declared_vars = set()  # Track declared variables
        self.issues: list[tuple[int, str, str]] = []  # Track transpilation issues
        self.source_lines: list[str] = []  # Store source code lines
        self.var_types: dict[str, type | None] = {}  # Track variable types

        # Map built-in functions to their transformation functions.
        self.builtin_transforms = {
            "range": self.transform_range,
            "len": self.transform_len,
        }

    def add_issue(self, node: ast.AST, message: str) -> None:
        """Add a transpilation issue with source code context."""
        if hasattr(node, "lineno"):
            line_no = node.lineno
            line_text = self.source_lines[line_no - 1].strip()
            self.issues.append((line_no, message, line_text))

    def visit(self, node):
        try:
            return super().visit(node)
        except TranspilerError as e:
            if e.issues:
                self.issues.extend(e.issues)
            return ""  # Return empty string for failed conversions

    def generic_visit(self, node):
        self.add_issue(node, f"Unsupported syntax: {type(node).__name__}")
        return ""

    def indent(self) -> str:
        return "    " * self.indent_level

    # === Function Definition ===
    def visit_FunctionDef(self, node: ast.FunctionDef):  # noqa: N802
        # Extract parameter names and types from type hints
        params = []
        for arg in node.args.args:
            params.append(arg.arg)
            if arg.annotation and isinstance(arg.annotation, ast.Name):
                type_name = arg.annotation.id
                type_obj = globals().get(type_name, getattr(builtins, type_name, None))
                if type_obj is not None:
                    self.var_types[arg.arg] = type_obj

        header = f"function {node.name}({', '.join(params)}) " + "{"
        self.js_lines.append(header)
        self.indent_level += 1

        for stmt in node.body:
            self.visit(stmt)
        self.indent_level -= 1
        self.js_lines.append("}")

    # === Attribute ===
    def visit_Attribute(self, node: ast.Attribute):
        # Simply return a dotted string: e.g., gr.Textbox
        value = self.visit(node.value)
        return f"{value}.{node.attr}"

    # === Return Statement ===
    def visit_Return(self, node: ast.Return):  # noqa: N802
        ret_val = "" if node.value is None else self.visit(node.value)
        self.js_lines.append(f"{self.indent()}return {ret_val};")

    # === Expression Statements ===
    def visit_Expr(self, node: ast.Expr):  # noqa: N802
        expr = self.visit(node.value)
        self.js_lines.append(f"{self.indent()}{expr};")

    # === Assignment ===
    def visit_Assign(self, node: ast.Assign):  # noqa: N802
        if len(node.targets) != 1:
            raise TranspilerError("Multiple assignment targets are not supported yet.")
        target_node = node.targets[0]
        target = self.visit(target_node)
        value = self.visit(node.value)

        if (
            isinstance(target_node, ast.Name)
            and target_node.id not in self.declared_vars
        ):
            self.declared_vars.add(target_node.id)
            expr_type = self.get_expr_type(node.value)
            if expr_type is not None:
                self.var_types[target_node.id] = expr_type
            self.js_lines.append(f"{self.indent()}let {target} = {value};")
        else:
            self.js_lines.append(f"{self.indent()}{target} = {value};")

    # === Binary Operations ===
    def check_type_safety(self, node: ast.AST, *exprs: ast.AST, context: str) -> None:
        """
        Check if an operation is type-safe.
        Raises TranspilerError if types are ambiguous or incompatible.
        """
        types = [self.get_expr_type(expr) for expr in exprs]

        # Check for unknown types
        if any(t is None for t in types):
            self.add_issue(
                node,
                f"Ambiguous operation: Cannot determine types for {context}. "
                "Operation behavior may differ in JavaScript based on types.",
            )
            raise TranspilerError()

        # Check for type consistency if multiple expressions
        if len(types) > 1 and not all(t == types[0] for t in types):
            type_names = [t.__name__ for t in types]
            self.add_issue(
                node,
                f"Ambiguous operation: Mixed types ({', '.join(type_names)}) in {context}. "
                "Behavior may differ in JavaScript.",
            )
            raise TranspilerError()

    def visit_BinOp(self, node: ast.BinOp):  # noqa: N802
        left = self.visit(node.left)
        right = self.visit(node.right)
        op = self.visit(node.op)

        self.check_type_safety(
            node, node.left, node.right, context=f"'{left} {op} {right}'"
        )
        return f"({left} {op} {right})"

    def visit_Add(self, node: ast.Add):  # noqa: N802, ARG002
        return "+"

    def visit_Sub(self, node: ast.Sub):  # noqa: N802, ARG002
        return "-"

    def visit_Mult(self, node: ast.Mult):  # noqa: N802, ARG002
        return "*"

    def visit_Div(self, node: ast.Div):  # noqa: N802, ARG002
        return "/"

    # === Comparison Operations ===
    def visit_Compare(self, node: ast.Compare):  # noqa: N802
        if len(node.ops) != 1 or len(node.comparators) != 1:
            raise TranspilerError("Only single comparisons are supported")
        op = node.ops[0]
        left = self.visit(node.left)
        right = self.visit(node.comparators[0])
        # Handle membership tests separately since types may differ.
        if isinstance(op, ast.In):
            # Translate Python "a in b" to JS "b.includes(a)"
            return f"{right}.includes({left})"
        elif isinstance(op, ast.NotIn):
            # Translate Python "a not in b" to JS "!b.includes(a)"
            return f"!{right}.includes({left})"
        else:
            # For other comparisons, check type safety.
            self.check_type_safety(
                node,
                node.left,
                node.comparators[0],
                context=f"comparison {left} {self.visit(op)} {right}",
            )
            op_str = self.visit(op)
            return f"({left} {op_str} {right})"

    def visit_Gt(self, node: ast.Gt):  # noqa: N802, ARG002
        return ">"

    def visit_Lt(self, node: ast.Lt):  # noqa: N802, ARG002
        return "<"

    def visit_GtE(self, node: ast.GtE):  # noqa: N802, ARG002
        return ">="

    def visit_LtE(self, node: ast.LtE):  # noqa: N802, ARG002
        return "<="

    def visit_Eq(self, node: ast.Eq):  # noqa: N802, ARG002
        return "==="

    def visit_NotEq(self, node: ast.NotEq):  # noqa: N802, ARG002
        return "!=="

    # (Optional: in case In or NotIn are visited directly.)
    def visit_In(self, node: ast.In):
        return "in"

    def visit_NotIn(self, node: ast.NotIn):
        return "not in"

    # === If Statement ===
    def visit_If(self, node: ast.If):  # noqa: N802
        test = self.visit(node.test)
        self.js_lines.append(f"{self.indent()}if ({test}) " + "{")
        self.indent_level += 1
        for stmt in node.body:
            self.visit(stmt)
        self.indent_level -= 1
        self.js_lines.append(f"{self.indent()}" + "}")

        # Handle elif and else clauses
        current = node
        while (
            current.orelse
            and len(current.orelse) == 1
            and isinstance(current.orelse[0], ast.If)
        ):
            current = current.orelse[0]
            test = self.visit(current.test)
            self.js_lines.append(f"{self.indent()}else if ({test}) " + "{")
            self.indent_level += 1
            for stmt in current.body:
                self.visit(stmt)
            self.indent_level -= 1
            self.js_lines.append(f"{self.indent()}" + "}")

        # Handle final else clause if it exists
        if current.orelse:
            self.js_lines.append(f"{self.indent()}else " + "{")
            self.indent_level += 1
            for stmt in current.orelse:
                self.visit(stmt)
            self.indent_level -= 1
            self.js_lines.append(f"{self.indent()}" + "}")

    # === Built-in Function Transformations ===
    def transform_range(self, node: ast.Call) -> str:
        """Transform Python's range() to an equivalent JavaScript array expression."""
        args = [self.visit(arg) for arg in node.args]
        for arg in node.args:
            self.check_type_safety(arg, arg, context="range() argument")
        if len(args) == 1:  # range(stop)
            return f"Array.from({{length: {args[0]}}}, (_, i) => i)"
        elif len(args) == 2:  # range(start, stop)
            return f"Array.from({{length: {args[1]} - {args[0]}}}, (_, i) => i + {args[0]})"
        elif len(args) == 3:  # range(start, stop, step)
            raise TranspilerError("range() with step argument is not supported yet")
        else:
            raise TranspilerError("Invalid number of arguments for range()")

    def transform_len(self, node: ast.Call) -> str:
        """Transform Python's len() to the equivalent JavaScript property access."""
        if len(node.args) != 1:
            raise TranspilerError("len() takes exactly one argument")
        arg_code = self.visit(node.args[0])
        t = self.get_expr_type(node.args[0])
        # If the type is a dictionary, return Object.keys(...).length;
        if t is dict:
            return f"Object.keys({arg_code}).length"
        else:
            # For lists, tuples, and strings, use .length.
            return f"{arg_code}.length"

    # === Function Calls ===
    def _handle_gradio_component_updates(self, node: ast.Call):
        """Handle Gradio component calls and return JSON representation."""
        kwargs = {}
        for kw in node.keywords:
            if isinstance(kw.value, ast.Constant) and kw.value.value is None:
                # None values should remain None in the kwargs dictionary
                # so that they are converted to null, not "null" in json.dumps().
                kwargs[kw.arg] = None
                continue
            value = self.visit(kw.value)
            try:
                kwargs[kw.arg] = ast.literal_eval(value)
            except Exception:
                kwargs[kw.arg] = value
        kwargs["__type__"] = "update"
        return json.dumps(kwargs)

    def visit_Call(self, node: ast.Call):  # noqa: N802
        try:
            import gradio

            has_gradio = True
        except ImportError:
            has_gradio = False

        # Handle built-in functions via our transformation mapping.
        if isinstance(node.func, ast.Name):
            if node.func.id in self.builtin_transforms:
                return self.builtin_transforms[node.func.id](node)

            # Try to resolve if this is a Gradio component.
            if has_gradio:
                try:
                    # Handle direct update() call
                    if node.func.id == "update":
                        return self._handle_gradio_component_updates(node)

                    component_class = getattr(gradio, node.func.id, None)
                    if component_class and issubclass(
                        component_class, gradio.blocks.Block
                    ):
                        return self._handle_gradio_component_updates(node)
                except Exception:
                    pass

            for arg in node.args:
                self.check_type_safety(
                    arg, arg, context=f"argument in {node.func.id}() call"
                )
            self.add_issue(node, f'Unsupported function "{node.func.id}()"')
            return ""

        # Handle attribute access like gr.Textbox. (Note the updated check.)
        if isinstance(node.func, ast.Attribute) and has_gradio:
            try:
                # Now allow for module aliases such as "gr" as well as "gradio"
                if isinstance(node.func.value, ast.Name) and node.func.value.id in {
                    "gradio",
                    "gr",
                }:
                    # Handle gr.update() call
                    if node.func.attr == "update":
                        return self._handle_gradio_component_updates(node)

                    component_class = getattr(gradio, node.func.attr, None)
                    if component_class and issubclass(
                        component_class, gradio.blocks.Block
                    ):
                        return self._handle_gradio_component_updates(node)
            except Exception:
                pass

        # For other method calls (like obj.method())
        func = self.visit(node.func)
        args = [self.visit(arg) for arg in node.args]

        if isinstance(node.func, ast.Attribute):
            self.check_type_safety(
                node.func, node.func.value, context=f"object in method call {func}"
            )
            for arg in node.args:
                self.check_type_safety(
                    arg, arg, context=f"argument in method call {func}"
                )

        return f"{func}({', '.join(args)})"

    # === Variable Name ===
    def visit_Name(self, node: ast.Name):  # noqa: N802
        return node.id

    # === Constants ===
    def visit_Constant(self, node: ast.Constant):  # noqa: N802
        if node.value is None:
            return "null"
        return repr(node.value)

    # === For Loop ===
    def visit_For(self, node: ast.For):  # noqa: N802
        target = self.visit(node.target)
        iter_expr = self.visit(node.iter)

        # If iterating over a range, record that the loop variable is an int.
        if (
            isinstance(node.iter, ast.Call)
            and isinstance(node.iter.func, ast.Name)
            and node.iter.func.id == "range"
        ):
            if isinstance(node.target, ast.Name):
                self.var_types[node.target.id] = int

        self.js_lines.append(f"{self.indent()}for (let {target} of {iter_expr}) " + "{")
        self.indent_level += 1
        for stmt in node.body:
            self.visit(stmt)
        self.indent_level -= 1
        self.js_lines.append(f"{self.indent()}" + "}")

    # === While Loop ===
    def visit_While(self, node: ast.While):  # noqa: N802
        test = self.visit(node.test)
        self.js_lines.append(f"{self.indent()}while ({test}) " + "{")
        self.indent_level += 1
        for stmt in node.body:
            self.visit(stmt)
        self.indent_level -= 1
        self.js_lines.append(f"{self.indent()}" + "}")

    # === List ===
    def visit_List(self, node: ast.List):  # noqa: N802
        elements = [self.visit(elt) for elt in node.elts]
        return f"[{', '.join(elements)}]"

    # === Tuple ===
    def visit_Tuple(self, node: ast.Tuple):  # noqa: N802
        elements = [self.visit(elt) for elt in node.elts]
        return f"[{', '.join(elements)}]"

    # === List Comprehension ===
    def visit_ListComp(self, node: ast.ListComp):
        """
        Transform a Python list comprehension into a combination of filter and map calls.
        For example:
            [x * 2 for x in arr if x > 10]
        becomes:
            arr.filter(x => x > 10).map(x => x * 2)
        """
        if len(node.generators) != 1:
            self.add_issue(
                node, "Only single generator list comprehensions are supported"
            )
            raise TranspilerError()
        gen = node.generators[0]
        iter_js = self.visit(gen.iter)
        target_js = self.visit(gen.target)
        elt_js = self.visit(node.elt)
        if gen.ifs:
            # Join multiple ifs with logical AND.
            conditions = " && ".join(self.visit(if_node) for if_node in gen.ifs)
            result = f"{iter_js}.filter({target_js} => {conditions})"
            # Only add a map step if the element expression is different from the loop variable.
            if not (isinstance(node.elt, ast.Name) and node.elt.id == gen.target.id):
                result += f".map({target_js} => {elt_js})"
        else:
            result = f"{iter_js}.map({target_js} => {elt_js})"
        return result

    # === Subscript ===
    def visit_Subscript(self, node: ast.Subscript):  # noqa: N802
        value = self.visit(node.value)
        slice_value = self.visit(node.slice)
        return f"{value}[{slice_value}]"

    # === Augmented Assignment ===
    def visit_AugAssign(self, node: ast.AugAssign):  # noqa: N802
        target = self.visit(node.target)
        op = self.visit(node.op).strip()
        value = self.visit(node.value)
        self.js_lines.append(f"{self.indent()}{target} {op}= {value};")

    # === Boolean Operations ===
    def visit_BoolOp(self, node: ast.BoolOp):  # noqa: N802
        op = self.visit(node.op)
        values = [self.visit(value) for value in node.values]
        # Join the values with the operator.
        return f"({f' {op} '.join(values)})"

    def visit_And(self, node: ast.And):  # noqa: N802, ARG002
        return "&&"

    def visit_Or(self, node: ast.Or):  # noqa: N802, ARG002
        return "||"

    # === Dictionary ===
    def visit_Dict(self, node: ast.Dict):  # noqa: N802
        pairs = []
        for key, value in zip(node.keys, node.values):
            if key is None:  # Handle dict unpacking
                continue
            key_js = self.visit(key)
            value_js = self.visit(value)
            pairs.append(f"{key_js}: {value_js}")
        return f"{{{', '.join(pairs)}}}"

    def get_expr_type(self, node: ast.AST) -> type | None:
        """Determine the type of an expression if possible."""
        if isinstance(node, ast.Constant):
            return type(node.value)
        elif isinstance(node, ast.Name):
            # First check if we have a stored type from type hints or assignments.
            if node.id in self.var_types:
                return self.var_types[node.id]
            return None
        elif isinstance(node, ast.BinOp):
            left_type = self.get_expr_type(node.left)
            right_type = self.get_expr_type(node.right)
            if left_type == right_type and left_type is not None:
                return left_type
            return None
        elif isinstance(node, ast.Call):
            # We can't determine the return type of function calls yet.
            return None
        elif isinstance(node, ast.List):
            return list
        elif isinstance(node, ast.Dict):
            return dict
        elif isinstance(node, ast.Tuple):
            return tuple
        return None


def transpile(fn: Callable, validate: bool = False) -> str:
    """
    Transpiles a Python function to JavaScript and returns the JavaScript code as a string.

    Parameters:
        fn: The Python function to transpile.
        validate: If True, the function will be validated to ensure it takes no arguments & only returns gradio component property updates. This is used when Groovy is used inside Gradio and `gradio` must be installed to use this.

    Returns:
        The JavaScript code as a string.

    Raises:
        TranspilerError: If the function cannot be transpiled or if the transpiled function is not valid.
    """
    if validate:
        sig = inspect.signature(fn)
        if sig.parameters:
            param_names = list(sig.parameters.keys())
            raise TranspilerError(
                message=f"Function must take no arguments for client-side use, but got: {param_names}"
            )

    try:
        source = inspect.getsource(fn)
        source = textwrap.dedent(source)
    except Exception as e:
        raise TranspilerError(
            message="Could not retrieve source code from the function."
        ) from e

    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        raise TranspilerError(message="Could not parse function source.") from e

    if validate:
        try:
            import gradio  # noqa: F401
        except ImportError:
            raise TranspilerError(message="Gradio must be installed for validation.")

        func_node = None
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) and node.name == fn.__name__:
                func_node = node
                break

        if func_node:
            return_nodes = []
            for node in ast.walk(func_node):
                if isinstance(node, ast.Return) and node.value is not None:
                    return_nodes.append(node)

            if not return_nodes:
                raise TranspilerError(
                    message="Function must return Gradio component updates, but no return statement found."
                )

            for return_node in return_nodes:
                if not _is_valid_gradio_return(return_node.value):
                    line_no = return_node.lineno
                    line_text = source.splitlines()[line_no - 1].strip()
                    raise TranspilerError(
                        message=f"Function must only return Gradio component updates. Invalid return at line {line_no}: {line_text}"
                    )

    func_node = None
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.Lambda)):
            func_node = node
            break

    if func_node is None:
        raise TranspilerError(
            message="No function or lambda definition found in the provided source."
        )

    visitor = PythonToJSVisitor()
    visitor.source_lines = source.splitlines()

    if isinstance(func_node, ast.Lambda):
        args = [arg.arg for arg in func_node.args.args]
        visitor.js_lines.append(f"function ({', '.join(args)}) " + "{")
        visitor.indent_level += 1
        visitor.js_lines.append(
            f"{visitor.indent()}return {visitor.visit(func_node.body)};"
        )
        visitor.indent_level -= 1
        visitor.js_lines.append("}")
    else:
        visitor.visit(func_node)

    if visitor.issues:
        raise TranspilerError(issues=visitor.issues)

    return "\n".join(visitor.js_lines)


def _is_valid_gradio_return(node: ast.AST) -> bool:
    """
    Check if a return value is a valid Gradio component or collection of components.

    Args:
        node: The AST node representing the return value

    Returns:
        bool: True if the return value is valid, False otherwise
    """
    # Check for direct Gradio component call
    if isinstance(node, ast.Call):
        if isinstance(node.func, ast.Attribute) and isinstance(
            node.func.value, ast.Name
        ):
            if node.func.value.id in {"gr", "gradio"}:
                try:
                    import gradio

                    if node.func.attr == "update":
                        return True

                    component_class = getattr(gradio, node.func.attr, None)
                    if component_class and issubclass(
                        component_class, gradio.blocks.Block
                    ):
                        if node.args:
                            return False
                        for kw in node.keywords:
                            if kw.arg == "value":
                                return False
                        return True
                except (ImportError, AttributeError):
                    pass
                return False
        elif isinstance(node.func, ast.Name):
            try:
                import gradio

                if node.func.id == "update":
                    return True

                component_class = getattr(gradio, node.func.id, None)
                if component_class and issubclass(component_class, gradio.blocks.Block):
                    if node.args:
                        return False
                    for kw in node.keywords:
                        if kw.arg == "value":
                            return False
                    return True
            except (ImportError, AttributeError):
                pass
            return False

    elif isinstance(node, (ast.Tuple, ast.List)):
        if not node.elts:
            return False
        return all(_is_valid_gradio_return(elt) for elt in node.elts)

    return False


# === Example Usage ===

if __name__ == "__main__":
    import gradio as gr

    def filter_rows_by_term():
        return gr.update(selected=2, visible=True, info=None)

    js_code = transpile(filter_rows_by_term, validate=True)
    print(js_code)

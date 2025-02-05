import pytest

from gradio.js_transpiler import TranspilerError, transpile


def test_basic_arithmetic():
    def simple_add(a, b):
        return a + b

    expected = """function simple_add(a, b) {
    return (a + b);
}"""
    assert transpile(simple_add).strip() == expected.strip()


def test_if_else():
    def check_value(x):
        if x > 10:
            return "high"
        else:
            return "low"

    expected = """function check_value(x) {
    if ((x > 10)) {
        return 'high';
    }
    else {
        return 'low';
    }
}"""
    assert transpile(check_value).strip() == expected.strip()


def test_variable_assignment():
    def assign_vars(x):
        y = x * 2
        z = y + 1
        return z

    expected = """function assign_vars(x) {
    let y = (x * 2);
    let z = (y + 1);
    return z;
}"""
    assert transpile(assign_vars).strip() == expected.strip()


def test_for_loop_range():
    def sum_range(n):
        total = 0
        for i in range(n):
            total = total + i
        return total

    expected = """function sum_range(n) {
    let total = 0;
    for (let i = 0; i < n; i++) {
        total = (total + i);
    }
    return total;
}"""
    assert transpile(sum_range).strip() == expected.strip()


def test_while_loop():
    def countdown(n):
        while n > 0:
            n = n - 1
        return n

    expected = """function countdown(n) {
    while ((n > 0)) {
        let n = (n - 1);
    }
    return n;
}"""
    assert transpile(countdown).strip() == expected.strip()


def test_list_operations():
    def make_list(x):
        arr = [1, 2, x]
        arr[0] = x
        return arr

    expected = """function make_list(x) {
    let arr = [1, 2, x];
    arr[0] = x;
    return arr;
}"""
    assert transpile(make_list).strip() == expected.strip()


def test_comparison_operators():
    def compare_values(a, b):
        if a == b:
            return "equal"
        elif a > b:
            return "greater"
        else:
            return "less"

    expected = """function compare_values(a, b) {
    if ((a === b)) {
        return 'equal';
    }
    else if ((a > b)) {
        return 'greater';
    }
    else {
        return 'less';
    }
}"""
    assert transpile(compare_values).strip() == expected.strip()


def test_boolean_operations():
    def logical_ops(a, b):
        return a and b or not a

    with pytest.raises(TranspilerError):
        # Should raise error due to unsupported 'not' operator
        transpile(logical_ops)


def test_dict_operations():
    def create_dict(key, value):
        d = {"fixed": 42, key: value}
        return d

    expected = """function create_dict(key, value) {
    let d = {'fixed': 42, key: value};
    return d;
}"""
    assert transpile(create_dict).strip() == expected.strip()

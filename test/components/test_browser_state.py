from pydantic import BaseModel

import gradio as gr


class Person(BaseModel):
    name: str
    age: int


class TestBrowserState:
    def test_preprocess_returns_default_for_none(self):
        state = gr.BrowserState(default_value={"key": "value"})
        assert state.preprocess(None) == {"key": "value"}

    def test_preprocess_passes_through_payload(self):
        state = gr.BrowserState(default_value="default")
        assert state.preprocess({"name": "Dan", "age": 20}) == {
            "name": "Dan",
            "age": 20,
        }

    def test_postprocess_passes_through_dict(self):
        state = gr.BrowserState()
        assert state.postprocess({"key": "value"}) == {"key": "value"}

    def test_postprocess_converts_pydantic_model_to_dict(self):
        state = gr.BrowserState()
        person = Person(name="Dan", age=20)
        result = state.postprocess(person)
        assert result == {"name": "Dan", "age": 20}
        assert isinstance(result, dict)

    def test_default_value_pydantic_model_converted_to_dict(self):
        state = gr.BrowserState(default_value=Person(name="Dan", age=20))
        assert state.default_value == {"name": "Dan", "age": 20}
        assert isinstance(state.default_value, dict)

    def test_default_value_plain_types_unchanged(self):
        state_str = gr.BrowserState(default_value="hello")
        assert state_str.default_value == "hello"

        state_int = gr.BrowserState(default_value=42)
        assert state_int.default_value == 42

        state_dict = gr.BrowserState(default_value={"a": 1})
        assert state_dict.default_value == {"a": 1}

        state_none = gr.BrowserState()
        assert state_none.default_value is None

    def test_preprocess_returns_dict_for_pydantic_default(self):
        """When default_value is a Pydantic model and payload is None,
        preprocess should return a dict (not a string)."""
        state = gr.BrowserState(default_value=Person(name="Dan", age=20))
        result = state.preprocess(None)
        assert isinstance(result, dict)
        assert result == {"name": "Dan", "age": 20}

    def test_postprocess_nested_pydantic_model(self):
        class Address(BaseModel):
            city: str
            zip_code: str

        class PersonWithAddress(BaseModel):
            name: str
            address: Address

        state = gr.BrowserState()
        person = PersonWithAddress(
            name="Dan", address=Address(city="NYC", zip_code="10001")
        )
        result = state.postprocess(person)
        assert result == {
            "name": "Dan",
            "address": {"city": "NYC", "zip_code": "10001"},
        }

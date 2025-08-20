from collections import namedtuple
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import ClassVar, Literal, Union
from uuid import UUID

import pytest
from gradio_client.utils import json_schema_to_python_type
from pydantic import Field
from pydantic.networks import AnyUrl, EmailStr, IPvAnyAddress

from gradio.data_classes import GradioModel, GradioRootModel


class StringModel(GradioModel):
    data: str
    answer: ClassVar = "dict(data: str)"


class IntegerRootModel(GradioRootModel):
    root: int

    answer: ClassVar = "int"


class FloatModel(GradioModel):
    data: float

    answer: ClassVar = "dict(data: float)"


class ListModel(GradioModel):
    items: list[int]

    answer: ClassVar = "dict(items: list[int])"


class DictModel(GradioModel):
    data_dict: dict[str, int]

    answer: ClassVar = "dict(data_dict: dict(str, int))"


class DictModel2(GradioModel):
    data_dict: dict[str, list[float]]

    answer: ClassVar = "dict(data_dict: dict(str, list[float]))"


class OptionalModel(GradioModel):
    optional_data: int | None

    answer: ClassVar = "dict(optional_data: int | None)"


class ColorEnum(Enum):
    RED = "red"
    GREEN = "green"
    BLUE = "blue"


class EnumRootModel(GradioModel):
    color: ColorEnum

    answer: ClassVar = "dict(color: Literal['red', 'green', 'blue'])"


class EmailModel(GradioModel):
    email: EmailStr

    answer: ClassVar = "dict(email: str)"


class RootWithNestedModel(GradioModel):
    nested_int: IntegerRootModel
    nested_enum: EnumRootModel
    nested_dict: DictModel2

    answer: ClassVar = "dict(nested_int: int, nested_enum: dict(color: Literal['red', 'green', 'blue']), nested_dict: dict(data_dict: dict(str, list[float])))"


class LessNestedModel(GradioModel):
    nested_int: int
    nested_enum: ColorEnum
    nested_dict: dict[str, list[Union[int, float]]]

    answer: ClassVar = "dict(nested_int: int, nested_enum: Literal['red', 'green', 'blue'], nested_dict: dict(str, list[int | float]))"


class StatusModel(GradioModel):
    status: Literal["active", "inactive"]

    answer: ClassVar = "dict(status: Literal['active', 'inactive'])"


class PointModel(GradioRootModel):
    root: tuple[float, float]

    answer: ClassVar = "tuple[float, float]"


class UuidModel(GradioModel):
    uuid: UUID

    answer: ClassVar = "dict(uuid: str)"


class UrlModel(GradioModel):
    url: AnyUrl

    answer: ClassVar = "dict(url: str)"


class CustomFieldModel(GradioModel):
    name: str = Field(..., title="Name of the item", max_length=50)
    price: float = Field(..., title="Price of the item", gt=0)

    answer: ClassVar = "dict(name: str, price: float)"


class DurationModel(GradioModel):
    duration: timedelta

    answer: ClassVar = "dict(duration: str)"


class IPv4Model(GradioModel):
    ipv4_address: IPvAnyAddress  # type: ignore

    answer: ClassVar = "dict(ipv4_address: str)"


class DateTimeModel(GradioModel):
    created_at: datetime
    updated_at: datetime

    answer: ClassVar = "dict(created_at: str, updated_at: str)"


class SetModel(GradioModel):
    unique_numbers: set[int]

    answer: ClassVar = "dict(unique_numbers: list[int])"


class ItemModel(GradioModel):
    name: str
    price: float


class OrderModel(GradioModel):
    items: list[ItemModel]

    answer: ClassVar = "dict(items: list[dict(name: str, price: float)])"


class TemperatureUnitEnum(Enum):
    CELSIUS = "Celsius"
    FAHRENHEIT = "Fahrenheit"
    KELVIN = "Kelvin"


class CartItemModel(GradioModel):
    product_name: str = Field(..., title="Name of the product", max_length=50)
    quantity: int = Field(..., title="Quantity of the product", ge=1)
    price_per_unit: float = Field(..., title="Price per unit", gt=0)


class ShoppingCartModel(GradioModel):
    items: list[CartItemModel]

    answer: ClassVar = "dict(items: list[dict(product_name: str, quantity: int, price_per_unit: float)])"


class CoordinateModel(GradioModel):
    latitude: float
    longitude: float


class TupleListModel(GradioModel):
    data: list[tuple[int, str]]

    answer: ClassVar = "dict(data: list[tuple[int, str]]"


class PathListModel(GradioModel):
    file_paths: list[Path]

    answer: ClassVar = "dict(file_paths: list[str])"


class PostModel(GradioModel):
    author: str
    content: str
    tags: list[str]
    likes: int = 0

    answer: ClassVar = "dict(author: str, content: str, tags: list[str], likes: int)"


Person = namedtuple("Person", ["name", "age"])


class NamedTupleDictionaryModel(GradioModel):
    people: dict[str, Person]

    answer: ClassVar = "dict(people: dict(str, tuple[Any, Any]))"


MODELS = [
    StringModel,
    IntegerRootModel,
    FloatModel,
    ListModel,
    DictModel,
    DictModel2,
    OptionalModel,
    EnumRootModel,
    EmailModel,
    RootWithNestedModel,
    LessNestedModel,
    StatusModel,
    PointModel,
    UuidModel,
    UrlModel,
    CustomFieldModel,
    DurationModel,
    IPv4Model,
    DateTimeModel,
    SetModel,
    OrderModel,
    ShoppingCartModel,
    PathListModel,
    NamedTupleDictionaryModel,
]


@pytest.mark.parametrize("model", MODELS)
def test_api_info_for_model(model):
    assert json_schema_to_python_type(model.model_json_schema()) == model.answer

from hatchling.plugin import hookimpl
from .builder import LiteBuilder

@hookimpl
def hatch_register_builder():
    return LiteBuilder
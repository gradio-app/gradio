"""Implements a StateHolder class to store state in the backend."""
from __future__ import annotations

from typing import Any, Dict


class StateHolder:
    state_dict: Dict[str, Any] = {}
    
    def __init__(self, id):
        self.__id = id
        
    def __setattr__(self, name, value):
        if name.startswith("_"):
            self.__dict__[name] = value
        else:
            StateHolder.state_dict[(self.__id, name)] = value

    def __getattr__(self, name):
        if name.startswith("_"):
            return self.__dict__[name]
        else:
            return StateHolder.state_dict.get((self.__id, name), None)
            

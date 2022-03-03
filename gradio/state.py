"""Implements a StateHolder class to store state in the backend."""
from __future__ import annotations

from typing import Any, Dict


class StateHolder:
    state_dict: Dict[str, Any] = {}
    
    def __init__(self, id):
        self.id = id
        
    def __setattr__(self, name, value):
        if name == "state":
            StateHolder.state_dict[self.id] = value
        else:
            self.__dict__[name] = value
            

    def __getattr__(self, name):
        if name == "state":
            return StateHolder.state_dict.get(self.id, None)
        else:
            return self.__dict__[name]
            

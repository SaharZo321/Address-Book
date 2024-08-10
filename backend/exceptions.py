
from typing import Any


class UniqueException(Exception):
    def __init__(self, field: str, value: Any) -> None:
        self.field = field
        self.value = value

class ContactNotFoundException(Exception):
    def __init__(self, id: Any) -> None:
        self.id = id
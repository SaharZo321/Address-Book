from typing import Any
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError


class UniqueException(Exception):
    def __init__(self, field: str, value: Any) -> None:
        self.field = field
        self.value = value


class NotFoundException(Exception):
    def __init__(self, object_type: str, field_name: str, value: Any) -> None:
        self.object_type = object_type
        self.field_name = field_name
        self.value = value

class CredentialsException(Exception):
    pass

class InactiveUserException(Exception):
    pass


def unique_exception(
    error: IntegrityError, instance: BaseModel, table_name: str
):
    msg = str(error.args[0])
    field = msg[msg.index(f"{table_name}.") + len(table_name) + 1 :]
    value = getattr(instance, field)
    return UniqueException(field=field, value=value)

from typing import Any, Dict, Optional
from typing_extensions import Annotated, Doc
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, Request, status


class ErrorResponse(BaseModel):
    detail: str
    headers: Optional[dict[str, str]] = None


class UniqueException(HTTPException):
    def __init__(self, field: str, value: Any) -> None:
        self.field = field
        self.value = value
        super().__init__(
            status_code=409,
            detail=f"Field {field} is unique and already registered with value: {value}",
        )

    class Model(ErrorResponse):
        detail: str = (
            "Field {field} is unique and already registered with value: {value}"
        )
        headers: None = None


class NotFoundException(HTTPException):
    def __init__(self, object_type: str, field: str, value: Any) -> None:
        super().__init__(
            status_code=404,
            detail=f"{object_type} with {field} which equals {value} was not found",
        )

    class Model(ErrorResponse):
        detail: str = "{object_type} with {field} which equals {value} was not found"


class CredentialsException(HTTPException):
    def __init__(
        self,
    ) -> None:
        super().__init__(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    class Model(ErrorResponse):
        detail: str = "Invalid credentials"
        headers: dict[str, str] = {"WWW-Authenticate": "Bearer"}

class IncorrectPasswordException(HTTPException):
    def __init__(
        self,
    ) -> None:
        super().__init__(
            status_code=400,
            detail="Incorrect password",
        )

    class Model(ErrorResponse):
        detail: str = "Incorrect password"
        headers: None = None


class InvalidTokenException(HTTPException):
    def __init__(
        self,
    ) -> None:
        super().__init__(
            status_code=403,
            detail="Invalid or expired token",
        )

    class Model(ErrorResponse):
        detail: str = "Invalid or expired token"
        headers: None = None


class InactiveUserException(HTTPException):
    def __init__(self, status_code: int = 403) -> None:
        super().__init__(status_code=status_code, detail="Inactive user")

    class Model(ErrorResponse):
        detail: str = "Inactive user"
        headers: None = None


def unique_exception(error: IntegrityError, instance: BaseModel, table_name: str):
    msg = str(error.args[0])
    field = msg[msg.index(f"{table_name}.") + len(table_name) + 1 :]
    value = getattr(instance, field)
    return UniqueException(field=field, value=value)

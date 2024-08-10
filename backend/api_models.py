from copy import deepcopy
from typing import Any, Literal, Type, get_type_hints, Optional
from pydantic import BaseModel, EmailStr, NonNegativeInt, PositiveInt, field_validator, create_model, model_validator
from pydantic.fields import FieldInfo
import re
import config


class ContactCreateRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr

    @model_validator(mode="after")
    def validate_contact(self):
        assert bool(re.match(config.word_pattern, self.first_name)), ValueError(
            "first name must contain only alphabet, ' or - characters."
        )
        assert bool(re.match(config.word_pattern, self.last_name)), ValueError(
            "last name must contain only alphabet, ' or - characters."
        )
        assert bool(re.match(config.phone_pattern, self.phone)), ValueError(
            "phone number must be in this pattern: +###-###-###-###"
        )
        return self


def partial_model(model: Type[BaseModel]):

    def make_field_optional(
        field: FieldInfo, default: Any = None
    ) -> tuple[Any, FieldInfo]:
        new = deepcopy(field)
        new.default = default
        new.annotation = Optional[field.annotation]
        return new.annotation, new

    return create_model(
        model.__name__,
        __base__=model,
        __module__=model.__module__,
        **{
            field_name: make_field_optional(field_info)
            for field_name, field_info in model.model_fields.items()
        },
    )


@partial_model
class UpdateContactRequest(ContactCreateRequest):
    ()

class ContactResponse(ContactCreateRequest):
    id: int

    class Config:
        from_attributes = True


class ContactField(BaseModel):
    field: str

    @field_validator("field")
    @classmethod
    def validate_field(cls, value: str):
        allowed_fields = list(get_type_hints(ContactResponse).keys())
        if value not in allowed_fields:
            raise ValueError(f"Field must be one of {allowed_fields}")
        return value


class Sort(ContactField):
    order: Literal["desc", "asc"]


type Operators = Literal[
    "=",
    "<=",
    ">=",
    ">",
    "<",
    "!=",
    "contains",
    "equals",
    "starts_with",
    "ends_with",
    "is_empty",
    "is_not_empty",
    "is_any_of",
]


class Filter(ContactField):
    operator: Operators
    values: list[str] = [""]


class Pagination(BaseModel):
    page_size: PositiveInt
    page: NonNegativeInt


class ContactsResponse(BaseModel):
    contacts: list[ContactResponse]
    total: NonNegativeInt


class ErrorResponse(BaseModel):
    detail: str

class DeleteResponse(BaseModel):
    contacts: list[ContactResponse]
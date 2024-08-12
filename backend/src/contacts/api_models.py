from copy import deepcopy
import re
from typing import Any, Literal, Optional, Type, get_type_hints
from pydantic import BaseModel, EmailStr, NonNegativeInt, PositiveInt, create_model, field_validator, model_validator
from pydantic.fields import FieldInfo

word_pattern = r"^[A-Za-z]+[-']{0,1}[A-Za-z]+$"
phone_pattern = r"^[+][1-9][\d]{0,2}-[\d]{3}-[\d]{3}-[\d]{3}$"

class ContactCreateRequest(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr

    @model_validator(mode="after")
    def validate_contact(self):
        assert bool(re.match(word_pattern, self.first_name)), ValueError(
            "first name must contain only alphabet, ' or - characters."
        )
        assert bool(re.match(word_pattern, self.last_name)), ValueError(
            "last name must contain only alphabet, ' or - characters."
        )
        assert bool(re.match(phone_pattern, self.phone)), ValueError(
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


type SortOrders = Literal["desc", "asc"]

class Sort(ContactField):
    order: SortOrders


type FilterOperators = Literal[
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
    operator: FilterOperators
    values: list[str] = [""]


class Pagination(BaseModel):
    page_size: PositiveInt
    page: NonNegativeInt


class ContactsResponse(BaseModel):
    contacts: list[ContactResponse]
    total: NonNegativeInt



class DeleteResponse(BaseModel):
    contacts: list[ContactResponse]
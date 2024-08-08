from typing import Literal, Optional
from pydantic import BaseModel

class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: str

class Contact(ContactCreate):
    id: int

    class Config:
        from_attributes = True

type Field = Literal["first_name", "last_name", "phone", "email", "id"]

class Sort(BaseModel):
    field: Field
    order: Literal["desc", "asc"]

class Filter(BaseModel):
    field: Field
    operator: Literal[
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
    values: list[str] | str = ""

class Pagination(BaseModel):
    page_size: int
    page: int

class Options(BaseModel):
    pagination: Pagination = Pagination(page_size=-1, page=0)
    filter: Optional[Filter] = None
    sort: Optional[Sort] = None

class Contacts(BaseModel):
    contacts: list[Contact]
    total: int

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
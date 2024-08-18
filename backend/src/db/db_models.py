from alchemical.aio import Alchemical
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import UUID, uuid4

db = Alchemical("sqlite:///backend//src//db//instance//addressbook.db")

class User(db.Model):
    __tablename__ = "users"
    
    
    uuid: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(unique=True)
    display_name: Mapped[str] = mapped_column(unique=False)
    hashed_password: Mapped[str] = mapped_column(unique=False)
    disabled: Mapped[bool] = mapped_column(unique=False, default=False)
    access_token: Mapped[str] = mapped_column(unique=False, default="")
    refresh_token: Mapped[str] = mapped_column(unique=False, default="")
    security_token: Mapped[str] = mapped_column(unique=False, default="")
    is_logged_in: Mapped[bool] = mapped_column(unique=False, default=False)

    contacts = relationship("Contact", back_populates="owner")

    def __init__(self, email: str, display_name: str, hashed_password: str):
        self.email = email
        self.display_name = display_name
        self.hashed_password = hashed_password

class Contact(db.Model):
    __tablename__ = "contacts"

    def __init__(self, email: str, first_name: str, last_name: str, phone: str, owner_uuid: UUID):
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
        self.owner_uuid = owner_uuid
    
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(unique=False)
    last_name: Mapped[str] = mapped_column(unique=False)
    phone: Mapped[str] = mapped_column(unique=False)
    email: Mapped[str] = mapped_column(unique=False)
    owner_uuid: Mapped[UUID] = mapped_column(ForeignKey("users.uuid"))

    owner = relationship("User", back_populates="contacts")
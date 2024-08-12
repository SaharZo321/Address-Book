from alchemical.aio import Alchemical
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from uuid import UUID, uuid4

db = Alchemical("sqlite:///backend//src//db////instance//addressbook.db")

class User(db.Model):
    __tablename__ = "users"
    
    uuid: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(unique=False, nullable=False)
    hashed_password: Mapped[str] = mapped_column(unique=False, nullable=False)
    disabled: Mapped[bool] = mapped_column(unique=False, nullable=False)
    access_token: Mapped[str] = mapped_column(unique=False, nullable=False)
    refresh_token: Mapped[str] = mapped_column(unique=False, nullable=False)
    is_logged_in: Mapped[bool] = mapped_column(unique=False, nullable=False)

    contacts = relationship("Contact", back_populates="owner")


class Contact(db.Model):
    __tablename__ = "contacts"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(unique=False, nullable=False)
    last_name: Mapped[str] = mapped_column(unique=False, nullable=False)
    phone: Mapped[str] = mapped_column(unique=False, nullable=False)
    email: Mapped[str] = mapped_column(unique=False, nullable=False)
    owner_uuid: Mapped[UUID] = mapped_column(ForeignKey("users.uuid"))

    owner = relationship("User", back_populates="contacts")
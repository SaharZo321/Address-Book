from sqlalchemy.orm import Mapped, mapped_column
from config import db


class Contact(db.Model):
    __tablename__ = "contacts"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(unique=False, nullable=False)
    last_name: Mapped[str] = mapped_column(unique=False, nullable=False)
    phone: Mapped[str] = mapped_column(unique=True, nullable=False)
    email: Mapped[str] = mapped_column(unique=True, nullable=False)
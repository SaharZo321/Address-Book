from sqlalchemy import Column, Integer, String
from config import Base


class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String, unique=False, nullable=False)
    last_name = Column(String, unique=False, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
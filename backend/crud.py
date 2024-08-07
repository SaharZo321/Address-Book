from sqlalchemy.orm import Session
import models, schemas


def get_contact_by_email(db: Session, email: str, exclude_id: int | None = None):
    return (
        db.query(models.Contact)
        .filter(models.Contact.email == email, models.Contact.id != exclude_id)
        .first()
    )


def get_contact_by_phone(db: Session, phone: str, exclude_id: int | None = None):
    return (
        db.query(models.Contact)
        .filter(models.Contact.phone == phone, models.Contact.id != exclude_id)
        .first()
    )


def get_contact(db: Session, id: str):
    return db.query(models.Contact).filter(models.Contact.id == id).first()


def get_contacts(db: Session, skip: int = 0, limit: int = 0):
    return db.query(models.Contact).all()


def create_contact(db: Session, contact: schemas.ContactCreate):
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def edit_contact(db: Session, contact: schemas.Contact):
    db_contact = get_contact(db=db, id=contact.id)
    db_contact.email = contact.email
    db_contact.phone = contact.phone
    db_contact.first_name = contact.first_name
    db_contact.last_name = contact.last_name
    db.commit()
    db.refresh(db_contact)
    return db_contact

def delete_contacts(db: Session, ids: list[int]):
    for id in ids:
        db_contact = get_contact(db=db, id=id)
        db.delete(db_contact)
    
    db.commit()
    return ids
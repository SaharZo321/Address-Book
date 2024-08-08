from fastapi import HTTPException
from sqlalchemy import Column, or_
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

def get_contact_by_id(db: Session, id: str):
    return db.query(models.Contact).filter(models.Contact.id == id).first()

def get_contacts(db: Session, options: schemas.Options):
    try:
        q = (
            db.query(models.Contact)
            .filter(get_filter(options.filter))
            .order_by(get_sort(options.sort))
        )
    except:
        raise HTTPException(400, detail="Filter or/and sort are not valid")
    total = q.count()
    pagination = options.pagination
    contacts = (
        q.offset(pagination.page * pagination.page_size)
        .limit(pagination.page_size)
        .all()
    )
    return schemas.Contacts(contacts=contacts, total=total)

def get_sort(sort: schemas.Sort | None):
    if sort is None:
        return models.Contact.id.asc()
    
    field: Column = getattr(models.Contact, sort.field)
    
    if sort.order == "desc":
        return field.desc()
    
    return field.asc()

ops = {
    '=' : lambda x, y: x == y,
    '>=' : lambda x, y: x >= y,
    '!=' : lambda x, y: x != y,
    '>' : lambda x, y: x > y,
    '<' : lambda x, y: x < y,
    "<=": lambda x, y: x <= y
}
       
def get_filter(filter: schemas.Filter | None):
    if filter is None:
        return models.Contact.first_name.contains("")
    
    field: Column = getattr(models.Contact, filter.field)
    
    match filter.operator:
        case "contains":
            return field.contains(filter.values)
        case "ends_with":
            return field.endswith(filter.values)
        case "equals":
            return field.is_(filter.values)
        case "is_any_of":
            return or_(*[field.is_(value) for value in filter.values])
        case "is_empty":
            return field.is_(filter.values)
        case "is_not_empty":
            return field.is_not(filter.values)
        case "starts_with":
            return field.startswith(filter.values)
        case "<" | "!=" | ">" | ">=" | "<=" | "=":
            return ops[filter.operator](field, filter.values)
            
def create_contact(db: Session, contact: schemas.ContactCreate):
    db_contact = models.Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


def edit_contact(db: Session, contact: schemas.Contact):
    db_contact = get_contact_by_id(db=db, id=contact.id)
    db_contact.email = contact.email
    db_contact.phone = contact.phone
    db_contact.first_name = contact.first_name
    db_contact.last_name = contact.last_name
    db.commit()
    db.refresh(db_contact)
    return db_contact


def delete_contacts(db: Session, ids: list[int]):
    for id in ids:
        db_contact = get_contact_by_id(db=db, id=id)
        db.delete(db_contact)

    db.commit()
    return ids

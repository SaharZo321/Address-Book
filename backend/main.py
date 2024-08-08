from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session
import crud, models, schemas
import config
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=config.engine)

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = config.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post(config.CREATE, response_model=schemas.Contact)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):

    db_contact_email = crud.get_contact_by_email(db, email=contact.email)
    if db_contact_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_contact_phone = crud.get_contact_by_phone(db, phone=contact.phone)
    if db_contact_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    return crud.create_contact(db=db, contact=contact)


@app.post(config.GET, response_model=schemas.Contacts)
def read_contacts(options: schemas.Options, db: Session = Depends(get_db)):
    print(options)
    return crud.get_contacts(db, options)

@app.get(config.GET + "{id}", response_model=schemas.Contact)
def read_contact(id: int, db: Session = Depends(get_db)):
    db_contact = crud.get_contact_by_id(db, id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_contact


@app.patch(config.UPDATE + "{id}", response_model=schemas.Contact)
def update_contact(id: int, contact: schemas.Contact, db: Session = Depends(get_db)):
    db_contact = crud.get_contact_by_id(db, id)

    if db_contact is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_contact_email = crud.get_contact_by_email(
        db=db, email=contact.email, exclude_id=id
    )
    if db_contact_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_contact_phone = crud.get_contact_by_phone(
        db=db, phone=contact.phone, exclude_id=id
    )
    if db_contact_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    return crud.edit_contact(db=db, contact=contact)

@app.delete(config.DELETE, response_model=list[int])
def delete_contacts(ids: list[int], db: Session = Depends(get_db)):
    if any((crud.get_contact_by_id(db, id) is None) for id in ids):
        raise HTTPException(status_code=400, detail="Some users were not found")
    return crud.delete_contacts(db, ids)

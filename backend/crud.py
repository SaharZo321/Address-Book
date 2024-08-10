import json
from typing import Optional
from fastapi import HTTPException
from sqlalchemy import Column, and_, or_, select
import sqlalchemy
import sqlalchemy.exc
import exceptions
import db_models
import api_models
from sqlalchemy.ext.asyncio import AsyncSession

async def get_contact_by_id(session: AsyncSession, id: int):
    try:
        return await session.get_one(entity=db_models.Contact, ident=id)
    except sqlalchemy.exc.NoResultFound as error:
        raise exceptions.ContactNotFoundException(id=id)


async def get_contacts(
    session: AsyncSession,
    filter: api_models.Filter,
    pagination: api_models.Pagination,
    sort: api_models.Sort,
):
    selection = (
        select(db_models.Contact).where(get_filter(filter)).order_by(get_sort(sort))
    )
    result = (await session.scalars(selection)).all()
    total = len(result)
    offset = pagination.page * pagination.page_size
    contacts = result[offset : offset + pagination.page_size]
    return api_models.ContactsResponse(contacts=contacts, total=total)


def get_sort(sort: api_models.Sort | None):
    if sort is None:
        return db_models.Contact.id.asc()

    field: Column = getattr(db_models.Contact, sort.field)

    if sort.order == "desc":
        return field.desc()

    return field.asc()


ops = {
    "=": lambda x, y: x == y,
    ">=": lambda x, y: x >= y,
    "!=": lambda x, y: x != y,
    ">": lambda x, y: x > y,
    "<": lambda x, y: x < y,
    "<=": lambda x, y: x <= y,
}


def get_filter(filter: api_models.Filter | None):
    if filter is None:
        return db_models.Contact.first_name.contains("")

    field: Column = getattr(db_models.Contact, filter.field)

    match filter.operator:
        case "contains":
            return and_(*[field.contains(value) for value in filter.values])
        case "ends_with":
            return field.endswith(filter.values[0])
        case "equals":
            return field.is_(filter.values[0])
        case "is_any_of":
            return or_(*[field.is_(value) for value in filter.values])
        case "is_empty":
            return field.is_(filter.values[0])
        case "is_not_empty":
            return field.is_not(filter.values[0])
        case "starts_with":
            return field.startswith(filter.values[0])
        case "<" | "!=" | ">" | ">=" | "<=" | "=":
            return ops[filter.operator](field, filter.values[0])


async def create_contacts(
    session: AsyncSession, contact: api_models.ContactCreateRequest
):
    try:
       
        db_contact = db_models.Contact(**contact.model_dump())
        session.add(db_contact)
        await session.commit()
        await session.refresh(db_contact)
        return db_contact

    except sqlalchemy.exc.IntegrityError as error:
        await session.flush()
        raise get_unique_exception(error=error, contact=contact)
    

def get_unique_exception(error: sqlalchemy.exc.IntegrityError, contact: api_models.UpdateContactRequest):
    msg = str(error.args[0])
    field = msg[msg.index("contacts.") + 9 :]
    value = getattr(contact, field)
    return exceptions.UniqueException(field=field, value=value)

async def edit_contact(
    session: AsyncSession,
    contact: api_models.UpdateContactRequest,
    contact_id: int
):
    db_contact = await get_contact_by_id(session, contact_id)
    try:
        db_contact.email = contact.email if contact.email else db_contact.email
        db_contact.phone = contact.phone if contact.phone else db_contact.phone
        db_contact.first_name = (
            contact.first_name if contact.first_name else db_contact.first_name
        )
        db_contact.last_name = (
            contact.last_name if contact.last_name else db_contact.last_name
        )
        await session.commit()
        await session.refresh(db_contact)
        return db_contact
    except sqlalchemy.exc.IntegrityError as error:
        await session.flush()
        raise get_unique_exception(error=error, contact=contact)


async def delete_contacts(session: AsyncSession, ids: list[int]):
    db_contacts = [(await get_contact_by_id(session, id)) for id in ids]
    for contact in db_contacts:
        await session.delete(contact)

    await session.commit()
    return db_contacts

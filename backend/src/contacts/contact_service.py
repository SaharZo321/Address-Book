from typing import Optional
from sqlalchemy import Column, and_, or_, select
from src.exc.exceptions import UniqueException, NotFoundException
import src.db.db_models as db_models
import src.contacts.api_models as api_models
from sqlalchemy.ext.asyncio import AsyncSession


async def get_contact_by_id(
    session: AsyncSession, contact_id: int, user: db_models.User
):
    contact = await session.scalar(
        select(db_models.Contact).where(
            db_models.Contact.id == contact_id, db_models.Contact.owner_uuid == user.uuid
        )
    )
    if not contact:
        raise NotFoundException(field_name="id", value=contact_id, object_type="Contact")
    return contact


async def get_contacts(
    session: AsyncSession,
    filter: api_models.Filter,
    pagination: api_models.Pagination,
    sort: api_models.Sort,
    user: db_models.User,
):
    selection = (
        select(db_models.Contact)
        .where(db_models.Contact.owner_uuid == user.uuid)
        .where(get_filter(filter))
        .order_by(get_sort(sort))
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


async def create_contact(
    session: AsyncSession,
    contact: api_models.ContactCreateRequest,
    user: db_models.User,
):
    await check_unique_contact(session=session, new_contact=contact, user=user)
    db_contact = db_models.Contact(**contact.model_dump(), owner_id=user.uuid)
    session.add(db_contact)
    await session.commit()
    await session.refresh(db_contact)
    return db_contact


async def check_unique_contact(
    session: AsyncSession,
    new_contact: api_models.UpdateContactRequest,
    user: db_models.User,
    exclude_id: Optional[int] = None,
):
    user_contacts = await session.scalars(
        select(db_models.Contact).where(db_models.Contact.owner_uuid == user.uuid)
    )
    for contact in user_contacts:
        if exclude_id == contact.id:
            continue
        if contact.email == new_contact.email:
            raise UniqueException(field="email", value=new_contact.email)
        if contact.phone == new_contact.phone:
            raise UniqueException(field="phone", value=new_contact.phone)


async def edit_contact(
    session: AsyncSession,
    contact: api_models.UpdateContactRequest,
    contact_id: int,
    user: db_models.User,
):
    await check_unique_contact(
        session=session, new_contact=contact, user=user, exclude_id=contact_id
    )
    db_contact = await get_contact_by_id(
        session=session, contact_id=contact_id, user=user
    )
    if contact.email:
        db_contact.email = contact.email
    if contact.phone:
        db_contact.phone = contact.phone
    if contact.first_name:
        db_contact.first_name = contact.first_name
    if contact.last_name:
        db_contact.last_name = contact.last_name
    
    await session.commit()
    await session.refresh(db_contact)
    return db_contact


async def delete_contacts(session: AsyncSession, ids: list[int], user: db_models.User):
    db_contacts = [
        (await get_contact_by_id(session=session, contact_id=id, user=user))
        for id in ids
    ]
    for contact in db_contacts:
        await session.delete(contact)

    await session.commit()
    return db_contacts

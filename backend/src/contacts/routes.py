
import json
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from src.contacts import contact_service
from src.db import db_models
from src.dependencies import get_session
from src.contacts import api_models
from src.exc.api_models import ErrorResponse
from src.dependencies import get_current_active_user

contacts_router = APIRouter()

@contacts_router.post("/", response_model=api_models.ContactResponse)
async def create_contact(
    contact: api_models.ContactCreateRequest,
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await contact_service.create_contact(
        session=session, contact=contact, user=current_user
    )


def QueryField():
    return Query(
        description="A contact field. Check the contact request schema for valid options."
    )


@contacts_router.get("/", response_model=api_models.ContactsResponse)
async def read_contacts(
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    page: Annotated[int, Query(description="Zero indexed page number")] = 0,
    page_size: int = 20,
    sort_field: Annotated[str, QueryField()] = "id",
    sort_order: api_models.SortOrders = "asc",
    filter_field: Annotated[str, QueryField()] = "id",
    filter_operator: api_models.FilterOperators = "contains",
    filter_values: Annotated[list[str], Query()] = [""],
):
    """Use this to get wanted contacts. All query parameters are optional."""
    try:
        pagination = api_models.Pagination(page=page, page_size=page_size)
        filter = api_models.Filter(
            field=filter_field, operator=filter_operator, values=filter_values
        )
        sort = api_models.Sort(field=sort_field, order=sort_order)
    except ValidationError as error:
        raise HTTPException(422, detail=json.loads(error.json()))

    return await contact_service.get_contacts(
        session=session,
        pagination=pagination,
        filter=filter,
        sort=sort,
        user=current_user,
    )


@contacts_router.get(
    "/{contact_id}",
    response_model=api_models.ContactResponse,
    responses={404: {"model": ErrorResponse}},
)
async def read_contact(
    contact_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
):
    """Use this to get a certain contact with a known id."""
    return await contact_service.get_contact_by_id(
        session=session, contact_id=contact_id, user=current_user
    )


@contacts_router.patch(
    "/{contact_id}",
    status_code=200,
    response_model=api_models.ContactResponse,
    responses={
        404: {"model": ErrorResponse},
        409: {"model": ErrorResponse},
    },
)
async def update_contact(
    contact_id: int,
    contact: api_models.UpdateContactRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
):
    """Use this to update a certain contact with a known id."""
    return await contact_service.edit_contact(
        session=session, contact=contact, contact_id=contact_id, user=current_user
    )


@contacts_router.delete(
    "/",
    status_code=200,
    response_model=api_models.ContactResponse,
    responses={404: {"model": ErrorResponse}},
)
async def delete_contacts(
    ids: Annotated[
        list[int], Query(description="Array of ID's of wanted contacts to be deleted")
    ],
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
):
    """Use this to delete multiple contacts."""
    return (
        await contact_service.delete_contacts(session=session, ids=ids, user=current_user)
    )[0]


@contacts_router.delete(
    "/{contact_id}",
    status_code=200,
    response_model=api_models.DeleteResponse,
    responses={404: {"model": ErrorResponse}},
)
async def delete_contact(
    contact_id: str,
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
):
    """Use this to delete a contact."""
    return api_models.DeleteResponse(
        contacts=await contact_service.delete_contacts(
            session=session, ids=[contact_id], user=current_user
        )
    )
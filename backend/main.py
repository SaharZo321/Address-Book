import json
from typing import Annotated, Literal
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
import crud
import api_models
import config
import exceptions
from fastapi.middleware import cors, trustedhost

app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    trustedhost.TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"]
)


# Dependency
async def get_session():
    async with config.db.Session() as session:
        yield session


def QueryField():
    return Query(
        description="A contact field. Check the contact request schema for valid options."
    )


@app.post(config.SINGLE, response_model=api_models.ContactResponse)
async def create_contact(
    contact: api_models.ContactCreateRequest,
    session: AsyncSession = Depends(get_session),
):
    return await crud.create_contacts(session=session, contact=contact)


@app.get(config.MULTIPLE, response_model=api_models.ContactsResponse)
async def read_contacts(
    page: Annotated[int, Query(description="Zero indexed page number")] = 0,
    page_size: int = 20,
    sort_field: Annotated[str, QueryField()] = "id",
    sort_order: Literal["asc", "desc"] = "asc",
    filter_field: Annotated[str, QueryField()] = "id",
    filter_operator: api_models.Operators = "contains",
    filter_values: Annotated[list[str], Query()] = [""],
    session: AsyncSession = Depends(get_session),
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

    return await crud.get_contacts(
        session=session, pagination=pagination, filter=filter, sort=sort
    )


@app.get(
    config.SINGLE + "{contact_id}",
    response_model=api_models.ContactResponse,
    responses={404: {"model": api_models.ErrorResponse}},
)
async def read_contact(contact_id: int, session: AsyncSession = Depends(get_session)):
    """Use this to get a certain contact with a known id."""
    return await crud.get_contact_by_id(session, contact_id)


@app.patch(
    config.SINGLE + "{contact_id}",
    status_code=200,
    response_model=api_models.ContactResponse,
    responses={
        404: {"model": api_models.ErrorResponse},
        409: {"model": api_models.ErrorResponse},
    },
)
async def update_contact(
    contact_id: int,
    contact: api_models.UpdateContactRequest,
    session: AsyncSession = Depends(get_session),
):
    """Use this to update a certain contact with a known id."""
    return await crud.edit_contact(
        session=session, contact=contact, contact_id=contact_id
    )


@app.delete(
    config.MULTIPLE,
    status_code=200,
    response_model=api_models.ContactResponse,
    responses={404: {"model": api_models.ErrorResponse}},
)
async def delete_contacts(
    ids: Annotated[
        list[int], Query(description="Array of ID's of wanted contacts to be deleted")
    ],
    session: AsyncSession = Depends(get_session),
):
    """Use this to delete multiple contacts."""
    return (await crud.delete_contacts(session, ids))[0]


@app.delete(
    config.SINGLE + "{contact_id}",
    status_code=200,
    response_model=api_models.DeleteResponse,
    responses={404: {"model": api_models.ErrorResponse}},
)
async def delete_contact(
    contact_id: str,
    session: AsyncSession = Depends(get_session),
):
    """Use this to delete a contact."""
    return api_models.DeleteResponse(
        contacts=await crud.delete_contacts(session, [contact_id])
    )


@app.exception_handler(exceptions.UniqueException)
async def unique_exception_handler(
    request: Request, exception: exceptions.UniqueException
):
    return JSONResponse(
        status_code=409,
        content=api_models.ErrorResponse(
            detail=f"Field ({exception.field}) is unique and already registered with value: ({exception.value})"
        ).model_dump(),
    )


@app.exception_handler(exceptions.ContactNotFoundException)
async def unique_exception_handler(
    request: Request, exception: exceptions.ContactNotFoundException
):
    return JSONResponse(
        status_code=404,
        content=api_models.ErrorResponse(
            detail=f"Contact with ID of {exception.id} was not found"
        ).model_dump(),
    )

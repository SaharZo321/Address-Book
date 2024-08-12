from fastapi import Request, status
from fastapi.responses import JSONResponse
from src.exc.exceptions import UniqueException, CredentialsException, NotFoundException, InactiveUserException
from src.exc.api_models import ErrorResponse


async def unique_exception_handler(
    request: Request, exception: UniqueException
):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content=ErrorResponse(
            detail=f"Field ({exception.field}) is unique and already registered with value: ({exception.value})"
        ).model_dump(),
    )


async def not_found_exception_handler(
    request: Request, exception: NotFoundException
):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content=ErrorResponse(
            detail=f"{exception.object_type} with {exception.field_name} of {exception.value} was not found"
        ).model_dump(),
    )


async def credentials_exception_handler(
    request: Request, exception: CredentialsException
):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content=ErrorResponse(
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ).model_dump(),
    )


async def inactive_user_exception_handler(
    request: Request, exception: InactiveUserException
):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorResponse(
            detail="Inactive User",
        ).model_dump(),
    )

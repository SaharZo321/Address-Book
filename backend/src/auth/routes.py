from fastapi import APIRouter
from typing import Annotated, Union
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from src.exceptions import (
    CredentialsException,
    InactiveUserException,
    IncorrectPasswordException,
    InvalidTokenException,
    UniqueException,
)
from src.auth import user_service
from src.auth import token_manager
from src.auth import api_models
from src.db import db_models
from src.dependencies import get_session, get_current_active_user
from src.auth.token_manager import (
    RefreshTokenBearer,
    TokenBearerResult,
)


auth_router = APIRouter()


@auth_router.get(
    "/me",
    response_model=api_models.UserResponse,
    responses={
        403: {"model": InactiveUserException.Model | CredentialsException.Model},
    },
)
async def read_users_me(
    current_user: Annotated[db_models.User, Depends(get_current_active_user)]
):
    return current_user


type AllForbidenExceptionModels = InactiveUserException.Model | InvalidTokenException.Model


@auth_router.post(
    "/login",
    response_model=api_models.TokenResponse,
    responses={
        403: {"model": InactiveUserException.Model},
        401: {"model": CredentialsException.Model},
    },
)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    user = await user_service.authorize_user(
        session, email=form_data.username, password=form_data.password
    )
    return await user_service.login_user(session=session, db_user=user)


@auth_router.post(
    "/register",
    response_model=api_models.UserResponse,
    responses={
        409: {"model": UniqueException.Model},
    },
)
async def create_user(
    user: api_models.CreateUserRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await user_service.create_user(session=session, user=user)


@auth_router.patch(
    "/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        400: {"model": IncorrectPasswordException.Model},
        403: {"model": AllForbidenExceptionModels},
    },
)
async def change_password(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
    request: api_models.ChangePasswordRequest,
):
    await user_service.change_password(
        session=session, db_user=current_user, request=request
    )


@auth_router.post(
    "/deactivate",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        400: {"model": IncorrectPasswordException.Model},
        403: {"model": AllForbidenExceptionModels},
    },
)
async def deactivate_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
    request: api_models.DeactivateUserRequest,
):
    await user_service.deactivate_user(
        session=session, request=request, db_user=current_user
    )


@auth_router.post(
    "/activate",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={401: {"model": CredentialsException.Model}},
)
async def activate_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    db_user = await user_service.authorize_user(
        session=session,
        email=form_data.username,
        password=form_data.password,
        check_active=False,
    )
    await user_service.activate_user(session=session, db_user=db_user)


@auth_router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        403: {"model": InvalidTokenException.Model},
    },
)
async def logout(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
):
    await user_service.logout_user(session=session, db_user=current_user)


@auth_router.get(
    "/refresh-token",
    response_model=api_models.TokenResponse,
    responses={403: {"model": InvalidTokenException.Model}},
)
async def get_new_tokens(
    session: Annotated[AsyncSession, Depends(get_session)],
    result: Annotated[TokenBearerResult, Depends(RefreshTokenBearer())],
):
    return await user_service.refresh_token(
        session, refresh_token=result.token, email=result.sub
    )


@auth_router.patch(
    "/display-name",
    response_model=api_models.UserResponse,
    responses={403: {"model": AllForbidenExceptionModels}},
)
async def change_display_name(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
    request: api_models.ChangeDisplayNameRequest,
):
    return await user_service.change_display_name(
        session=session, request=request, db_user=current_user
    )

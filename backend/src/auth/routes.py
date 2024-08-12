from fastapi import APIRouter
import json
from typing import Annotated, Literal
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from src import token_manager
from src.auth import password_manager, crud, api_models
from src.db import db_models
from src.exc.exceptions import InactiveUserException, NotFoundException, CredentialsException
import urllib
from src.dependencies import get_session, get_current_active_user


auth_router = APIRouter()


@auth_router.get("/me", response_model=api_models.UserResponse)
async def read_users_me(
    current_user: Annotated[db_models.User, Depends(get_current_active_user)]
):
    return current_user


@auth_router.post("/login", response_model=api_models.TokenResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    user = await crud.get_user_by_email(session=session, email=form_data.username)
    if not password_manager.verify_password(
        plain_password=form_data.password, hashed_password=user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    if user.disabled:
        raise InactiveUserException
    token_response = token_manager.create_tokens(user=user)
    await crud.login_user(session=session, db_user=user, tokens=token_response)
    return token_response


@auth_router.post("/register", response_model=api_models.NewUserResponse)
async def create_user(
    user: api_models.CreateUserRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    return await crud.create_user(session=session, user=user)


# @app.post("/reset-password/request/", response_model=api_models.RequestPasswordResetResponse, )
# async def reset_password_request(
#     pwd_request: api_models.RequestPasswordResetRequest,
#     session: Annotated[AsyncSession, Depends(get_session)],
# ):
#     """Not secure at all - for simulation only. Should be sent via email."""
#     user = await crud.users.get_user_by_email(session=session, email=pwd_request.email)
#     if user.disabled:
#         raise exceptions.InactiveUserException
#     if not pwd_request.redirectUrl:
#         pwd_request.redirectUrl = app.url
#     token = token_manager.create_access_token(payload=token_manager.JwtPayload(
#         sub=pwd_request.email,
#     ), expires_in_minutes=7)
#     return api_models.RequestPasswordResetResponse(
#         url=f"{pwd_request.redirectUrl}?{token}"
#     )

# @app.patch("/reset-password/", status_code=status.HTTP_204_NO_CONTENT)
# async def reset_password(
#     request: api_models.PasswordResetRequest,
#     session: Annotated[AsyncSession, Depends(get_session)],
# ):
#     payload = token_manager.get_payload(token=request.token, invalid_token_error=Exception())
#     if not payload.redirect or not payload.sub:
#         raise Exception()
#     email = payload.sub
#     user = await crud.users.edit_user(session=session, user=api_models.EditUserRequest(password=request.password, email=email))


@auth_router.patch("/change-password/", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
    request: api_models.ChangePasswordRequest,
):
    await crud.change_password(session=session, db_user=current_user, request=request)


@auth_router.patch("/deactivate/", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
):
    await crud.deactivate_user(session=session, db_user=current_user)


@auth_router.patch("/activate/", status_code=status.HTTP_204_NO_CONTENT)
async def activate_user(
    session: Annotated[AsyncSession, Depends(get_session)],
    request: api_models.ActivateUserRequest,
):
    await crud.activate_user(session=session, request=request)


@auth_router.patch("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[db_models.User, Depends(get_current_active_user)],
):
    await crud.logout_user(session=session, db_user=current_user)

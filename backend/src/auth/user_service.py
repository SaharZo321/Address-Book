from uuid import UUID
import uuid
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from src.auth import token_manager
from src.auth import password_manager, api_models
from src.exceptions import (
    InactiveUserException,
    IncorrectPasswordException,
    InvalidTokenException,
    NotFoundException,
    unique_exception,
    CredentialsException,
)
from src.db import db_models
from sqlalchemy.ext.asyncio import AsyncSession


async def get_user_by_email(session: AsyncSession, email: str):
    user = await session.scalar(
        select(db_models.User).where(db_models.User.email == email)
    )
    return user

async def get_user_by_uuid(session: AsyncSession, uuid: UUID):
    user = await session.scalar(
        select(db_models.User).where(db_models.User.uuid == uuid)
    )
    return user


async def authorize_user(
    session: AsyncSession,
    email: str,
    password: str,
    db_user: db_models.User = None,
    check_active=True,
):
    """Authenticats user. raises error 401 if not authorized"""
    user = await get_user_by_email(session, email) if not db_user else db_user
    if not user or not password_manager.is_password_valid(
        password, user.hashed_password
    ):
        raise CredentialsException
    if check_active and user.disabled:
        raise InactiveUserException
    return user


async def create_user(session: AsyncSession, user: api_models.CreateUserRequest):
    db_user = db_models.User(
        display_name=user.display_name,
        email=user.email,
        hashed_password=password_manager.get_password_hash(password=user.password),
    )
    try:
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
        return db_user
    except IntegrityError as error:
        await session.flush()
        raise unique_exception(error=error, instance=user, table_name="users")


async def change_password(session: AsyncSession, new_password, db_user: db_models.User):
    new_hashed_password = password_manager.get_password_hash(new_password)
    db_user.hashed_password = new_hashed_password
    db_user.security_token = ""
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def change_display_name(
    session: AsyncSession,
    request: api_models.ChangeDisplayNameRequest,
    db_user: db_models.User,
):
    db_user.display_name = request.display_name
    await session.commit()
    await session.refresh(db_user)
    return db_user


async def logout_user(session: AsyncSession, db_user: db_models.User):
    db_user.is_logged_in = False
    db_user.refresh_token = ""
    db_user.access_token = ""
    db_user.security_token = ""
    await session.commit()
    await session.refresh(db_user)


async def login_user(session: AsyncSession, db_user: db_models.User):
    db_user.is_logged_in = True
    new_access_token = token_manager.create_token(sub=db_user.uuid.hex, scope="access")
    db_user.access_token = new_access_token
    new_refresh_token = token_manager.create_token(sub=db_user.uuid.hex, scope="refresh")
    db_user.refresh_token = new_refresh_token
    await session.commit()
    await session.refresh(db_user)
    return api_models.TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


async def deactivate_user(session: AsyncSession, db_user: db_models.User):
    db_user.disabled = True
    await logout_user(session=session, db_user=db_user)


async def verify_password(
    session: AsyncSession, password: str, db_user: db_models.User
):
    if not password_manager.is_password_valid(password, db_user.hashed_password):
        raise IncorrectPasswordException
    security_token = token_manager.create_token(sub=db_user.uuid.hex, scope="security")
    db_user.security_token = security_token
    await session.commit()
    await session.refresh(db_user)
    return api_models.VerifyPasswordResponse(security_token=security_token)


async def activate_user(session: AsyncSession, db_user: db_models.User):
    db_user.disabled = False
    await session.commit()
    await session.refresh(db_user)


async def refresh_token(session: AsyncSession, refresh_token: str, uuid: UUID):
    db_user = await get_user_by_uuid(session=session, uuid=uuid)
    if not db_user or db_user.refresh_token != refresh_token:
        raise InvalidTokenException
    new_access_token = token_manager.create_token(sub=db_user.uuid.hex, scope="access")
    db_user.access_token = new_access_token
    new_refresh_token = token_manager.create_token(sub=db_user.uuid.hex, scope="refresh")
    db_user.refresh_token = new_refresh_token
    await session.commit()
    await session.refresh(db_user)
    return api_models.TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )
